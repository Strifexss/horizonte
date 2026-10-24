<?php

namespace App\Services;

use App\DTO\NovidadeDTO;
use App\Models\Novidade;
use App\Repositories\Interfaces\NovidadeRepositoryInterface;
use App\Services\Interfaces\NovidadesServiceInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Throwable;

class NovidadesService extends ServiceAbstract implements NovidadesServiceInterface
{
    public function __construct(
        private NovidadeRepositoryInterface $novidadeRepository
    ) {
        parent::__construct($novidadeRepository);
    }

    /**
     * @param  NovidadeDTO  $data
     */
    public function store($data)
    {
        $novas = $this->gravarArquivos($data->imagens);

        return $this->persistirComImagens($novas, fn () => DB::transaction(function () use ($data, $novas) {
            $novidade = parent::store([...$this->dadosPersistiveis($data), 'status' => Novidade::STATUS_RASCUNHO]);
            $this->novidadeRepository->adicionarImagens($novidade->id, $novas);

            return $novidade;
        }));
    }

    /**
     * @param  NovidadeDTO  $data
     */
    public function update($id, $data)
    {
        $this->novidadeRepository->find((int) $id);
        $novas = $this->gravarArquivos($data->imagens);

        [$novidade, $removidas] = $this->persistirComImagens($novas, fn () => DB::transaction(function () use ($id, $data, $novas) {
            $novidade = parent::update((int) $id, $this->dadosPersistiveis($data));
            $removidas = $this->novidadeRepository->removerImagens((int) $id, $data->remover_imagens);
            $this->novidadeRepository->adicionarImagens((int) $id, $novas);

            return [$novidade, $removidas];
        }));

        $this->apagarArquivos($removidas);

        return $novidade;
    }

    public function delete($id)
    {
        $this->novidadeRepository->find((int) $id);
        $caminhos = $this->novidadeRepository->caminhosDasImagens((int) $id);
        $excluida = parent::delete((int) $id);
        $this->apagarArquivos($caminhos);

        return $excluida;
    }

    public function alterarStatus(int $id, string $status): Novidade
    {
        /** @var Novidade $novidade */
        $novidade = $this->novidadeRepository->find($id);
        $dados = ['status' => $status];

        if ($status === Novidade::STATUS_PUBLICADO && $novidade->publicada_em === null) {
            $dados['publicada_em'] = now();
        }

        return parent::update($id, $dados);
    }

    public function pendentesPopup(int $usuarioId): Collection
    {
        return $this->novidadeRepository->pendentesPopup($usuarioId);
    }

    public function historicoDoUsuario(int $usuarioId): Collection
    {
        return $this->novidadeRepository->historicoDoUsuario($usuarioId);
    }

    public function dispensar(int $novidadeId, int $usuarioId): void
    {
        $this->novidadeRepository->findPublicada($novidadeId);
        $this->novidadeRepository->dispensar($usuarioId, $novidadeId);
    }

    public function diretorioImagens(): Collection
    {
        return $this->novidadeRepository->diretorioImagens();
    }

    public function excluirImagemDoDiretorio(string $arquivo): void
    {
        $this->novidadeRepository->excluirDoDiretorio($arquivo);
    }

    /**
     * @return array{titulo: string, descricao: string, categoria: string, cta_url: ?string, popup_automatico: bool}
     */
    private function dadosPersistiveis(NovidadeDTO $dto): array
    {
        return [
            'titulo' => $dto->titulo,
            'descricao' => $dto->descricao,
            'categoria' => $dto->categoria,
            'cta_url' => $dto->cta_url,
            'popup_automatico' => $dto->popup_automatico,
        ];
    }

    /**
     * @param  list<UploadedFile>  $imagens
     * @return list<string>
     */
    private function gravarArquivos(array $imagens): array
    {
        $caminhos = [];

        try {
            foreach ($imagens as $imagem) {
                $caminhos[] = $this->novidadeRepository->salvarImagem($imagem);
            }
        } catch (Throwable $e) {
            $this->apagarArquivos($caminhos);

            throw $e;
        }

        return $caminhos;
    }

    /**
     * @param  list<string>  $caminhos
     */
    private function apagarArquivos(array $caminhos): void
    {
        foreach ($caminhos as $caminho) {
            $this->novidadeRepository->apagarImagem($caminho);
        }
    }

    /**
     * Apaga as imagens recém-gravadas quando o registro não chega ao banco.
     *
     * @template TResultado
     *
     * @param  list<string>  $novas
     * @param  callable(): TResultado  $persistir
     * @return TResultado
     */
    private function persistirComImagens(array $novas, callable $persistir): mixed
    {
        try {
            return $persistir();
        } catch (Throwable $e) {
            $this->apagarArquivos($novas);

            throw $e;
        }
    }
}
