<?php

namespace App\Services;

use App\DTO\MenuBoardDTO;
use App\Models\Empresa;
use App\Models\MenuBoard;
use App\Repositories\Interfaces\MenuBoardRepositoryInterface;
use App\Services\Interfaces\MenuBoardsServiceInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Throwable;

class MenuBoardsService extends ServiceAbstract implements MenuBoardsServiceInterface
{
    public function __construct(
        private MenuBoardRepositoryInterface $menuBoardRepository
    ) {
        parent::__construct($menuBoardRepository);
    }

    public function indexDoUsuario(int $usuarioId): Collection
    {
        return $this->menuBoardRepository->indexComContagens((int) Empresa::idDoUsuario($usuarioId));
    }

    public function findComPaginas(int $id, int $usuarioId): MenuBoard
    {
        return $this->menuBoardRepository->findComPaginas($id, (int) Empresa::idDoUsuario($usuarioId));
    }

    /**
     * @param  MenuBoardDTO  $data
     */
    public function store($data)
    {
        return $this->salvarComImagens($data, [], function (array $paginas) use ($data) {
            $board = $this->menuBoardRepository->store($data->dadosDoBoard());
            $this->menuBoardRepository->sincronizarPaginas($board->id, $paginas);

            return $board;
        });
    }

    /**
     * @param  MenuBoardDTO  $data
     */
    public function update($id, $data)
    {
        $this->menuBoardRepository->findDaEmpresa((int) $id, (int) Empresa::atualId());
        $imagensAtuais = $this->menuBoardRepository->imagensDoBoard((int) $id);

        return $this->salvarComImagens($data, $imagensAtuais, function (array $paginas) use ($id, $data) {
            $board = $this->menuBoardRepository->update($id, $data->dadosDoBoard());
            $this->menuBoardRepository->sincronizarPaginas((int) $id, $paginas);

            return $board;
        });
    }

    public function delete($id)
    {
        $this->menuBoardRepository->findDaEmpresa((int) $id, (int) Empresa::atualId());
        $imagens = $this->menuBoardRepository->imagensDoBoard((int) $id);

        $excluido = parent::delete($id);
        array_map(fn (string $imagem) => $this->menuBoardRepository->apagarArquivoImagem($imagem), $imagens);

        return $excluido;
    }

    /**
     * Os boards da Empresa ficam travados até o commit, então ativações simultâneas entram em fila
     * e só um board termina ativo.
     */
    public function ativar(int $id, int $usuarioId): MenuBoard
    {
        $empresaId = (int) Empresa::idDoUsuario($usuarioId);

        return DB::transaction(function () use ($id, $empresaId) {
            $this->menuBoardRepository->travarDaEmpresa($empresaId);
            $this->menuBoardRepository->findDaEmpresa($id, $empresaId);
            $this->menuBoardRepository->desativarDaEmpresa($empresaId);
            $this->menuBoardRepository->marcarAtivo($id);

            return $this->menuBoardRepository->findDaEmpresa($id, $empresaId);
        });
    }

    public function findAtivoDaEmpresa(int $empresaId): ?MenuBoard
    {
        return $this->menuBoardRepository->findAtivoDaEmpresa($empresaId);
    }

    /**
     * Grava as imagens novas antes da transação e só apaga as que saíram do board depois do commit.
     * Uma página só pode manter uma imagem que já era deste board; se algo falhar, as novas são removidas.
     *
     * @param  list<string>  $imagensAtuais
     * @param  callable(list<array<string, mixed>>): MenuBoard  $salvar
     */
    private function salvarComImagens(MenuBoardDTO $data, array $imagensAtuais, callable $salvar): MenuBoard
    {
        $empresaId = (int) ($data->usuario_id !== null ? Empresa::idDoUsuario($data->usuario_id) : Empresa::atualId());
        $novas = [];

        try {
            $paginas = array_map(function (array $pagina) use ($imagensAtuais, $empresaId, &$novas): array {
                $imagemPath = in_array($pagina['imagem_atual'], $imagensAtuais, true) ? $pagina['imagem_atual'] : null;

                if ($pagina['imagem'] !== null) {
                    $imagemPath = $novas[] = $this->menuBoardRepository->salvarArquivoImagem($pagina['imagem'], $empresaId);
                }

                return [...$pagina, 'imagem_path' => $imagemPath];
            }, $data->paginas);

            $board = DB::transaction(fn () => $salvar($paginas));
        } catch (Throwable $e) {
            array_map(fn (string $imagem) => $this->menuBoardRepository->apagarArquivoImagem($imagem), $novas);

            throw $e;
        }

        $mantidas = array_filter(array_column($paginas, 'imagem_path'));
        foreach (array_diff($imagensAtuais, $mantidas) as $imagem) {
            $this->menuBoardRepository->apagarArquivoImagem($imagem);
        }

        return $board;
    }
}
