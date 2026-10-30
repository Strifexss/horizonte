<?php

namespace App\Services;

use App\DTO\ProdutoSearchDTO;
use App\Exceptions\ProdutoEmUsoException;
use App\Models\Produto;
use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use App\Services\Interfaces\ProdutosServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Throwable;

class ProdutosService extends ServiceAbstract implements ProdutosServiceInterface
{
    public function __construct(
        private ProdutoRepositoryInterface $produtoRepository
    ) {
        parent::__construct($produtoRepository);
    }

    public function indexFiltrado(ProdutoSearchDTO $filters): LengthAwarePaginator
    {
        return $this->produtoRepository->indexFiltrado($filters);
    }

    public function update($id, $data)
    {
        $this->produtoRepository->findDaEmpresa((int) $id);

        return parent::update($id, $data);
    }

    public function delete($id)
    {
        $produto = $this->produtoRepository->findDaEmpresa((int) $id);

        if ($this->produtoRepository->countParcelasByProdutoId((int) $id) > 0
            || $this->produtoRepository->countVendaItensByProdutoId((int) $id) > 0) {
            throw new ProdutoEmUsoException;
        }

        $excluido = parent::delete($id);
        $this->apagarArquivoFoto($produto->foto_path);

        return $excluido;
    }

    public function ativosDaEmpresa(int $empresaId): Collection
    {
        return $this->produtoRepository->ativosDaEmpresa($empresaId);
    }

    public function salvarFoto(int $id, UploadedFile $foto): Produto
    {
        $produto = $this->produtoRepository->findDaEmpresa($id);
        $fotoAnterior = $produto->foto_path;
        $fotoPath = $this->produtoRepository->salvarArquivoFoto($foto, (int) $produto->empresa_id);

        try {
            $produto = $this->produtoRepository->atualizarFoto($id, $fotoPath);
        } catch (Throwable $e) {
            $this->apagarArquivoFoto($fotoPath);

            throw $e;
        }

        $this->apagarArquivoFoto($fotoAnterior);

        return $produto;
    }

    public function removerFoto(int $id): Produto
    {
        $produto = $this->produtoRepository->findDaEmpresa($id);
        $fotoAnterior = $produto->foto_path;

        $produto = $this->produtoRepository->atualizarFoto($id, null);
        $this->apagarArquivoFoto($fotoAnterior);

        return $produto;
    }

    private function apagarArquivoFoto(?string $fotoPath): void
    {
        if ($fotoPath) {
            $this->produtoRepository->apagarArquivoFoto($fotoPath);
        }
    }
}
