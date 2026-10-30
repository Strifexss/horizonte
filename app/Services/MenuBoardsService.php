<?php

namespace App\Services;

use App\DTO\MenuBoardDTO;
use App\Models\MenuBoard;
use App\Repositories\Interfaces\MenuBoardRepositoryInterface;
use App\Services\Interfaces\MenuBoardsServiceInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
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
        return $this->menuBoardRepository->indexComContagens($usuarioId);
    }

    public function findComPaginas(int $id, int $usuarioId): MenuBoard
    {
        return $this->menuBoardRepository->findComPaginas($id, $usuarioId);
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
        $this->menuBoardRepository->findForUsuario((int) $id, (int) Auth::id());
        $imagensAtuais = $this->menuBoardRepository->imagensDoBoard((int) $id);

        return $this->salvarComImagens($data, $imagensAtuais, function (array $paginas) use ($id, $data) {
            $board = $this->menuBoardRepository->update($id, $data->dadosDoBoard());
            $this->menuBoardRepository->sincronizarPaginas((int) $id, $paginas);

            return $board;
        });
    }

    public function delete($id)
    {
        $this->menuBoardRepository->findForUsuario((int) $id, (int) Auth::id());
        $imagens = $this->menuBoardRepository->imagensDoBoard((int) $id);

        $excluido = parent::delete($id);
        array_map(fn (string $imagem) => $this->menuBoardRepository->apagarArquivoImagem($imagem), $imagens);

        return $excluido;
    }

    /**
     * Os boards do usuário ficam travados até o commit, então ativações simultâneas entram em fila
     * e só um board termina ativo.
     */
    public function ativar(int $id, int $usuarioId): MenuBoard
    {
        return DB::transaction(function () use ($id, $usuarioId) {
            $this->menuBoardRepository->travarDoUsuario($usuarioId);
            $this->menuBoardRepository->findForUsuario($id, $usuarioId);
            $this->menuBoardRepository->desativarDoUsuario($usuarioId);
            $this->menuBoardRepository->marcarAtivo($id);

            return $this->menuBoardRepository->findForUsuario($id, $usuarioId);
        });
    }

    public function findAtivoDoUsuario(int $usuarioId): ?MenuBoard
    {
        return $this->menuBoardRepository->findAtivoDoUsuario($usuarioId);
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
        $usuarioId = (int) ($data->usuario_id ?? Auth::id());
        $novas = [];

        try {
            $paginas = array_map(function (array $pagina) use ($imagensAtuais, $usuarioId, &$novas): array {
                $imagemPath = in_array($pagina['imagem_atual'], $imagensAtuais, true) ? $pagina['imagem_atual'] : null;

                if ($pagina['imagem'] !== null) {
                    $imagemPath = $novas[] = $this->menuBoardRepository->salvarArquivoImagem($pagina['imagem'], $usuarioId);
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
