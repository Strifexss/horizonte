<?php

namespace App\Services;

use App\DTO\ProdutoSearchDTO;
use App\Exceptions\ProdutoEmUsoException;
use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use App\Services\Interfaces\ProdutosServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

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
        $this->produtoRepository->findForUsuario((int) $id);

        return parent::update($id, $data);
    }

    public function delete($id)
    {
        $this->produtoRepository->findForUsuario((int) $id);

        if ($this->produtoRepository->countParcelasByProdutoId((int) $id) > 0
            || $this->produtoRepository->countVendaItensByProdutoId((int) $id) > 0) {
            throw new ProdutoEmUsoException;
        }

        return parent::delete($id);
    }
}
