<?php

namespace App\Services;

use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use App\Services\Interfaces\ProdutosServiceInterface;
use Illuminate\Support\Facades\DB;

class ProdutosService extends ServiceAbstract implements ProdutosServiceInterface
{
    public function __construct(
        private ProdutoRepositoryInterface $produtoRepository
    ) {
        parent::__construct($produtoRepository);
    }

    public function update($id, $data)
    {
        $this->produtoRepository->findForUsuario((int) $id);

        return parent::update($id, $data);
    }

    public function delete($id)
    {
        $this->produtoRepository->findForUsuario((int) $id);

        return DB::transaction(function () use ($id) {
            $this->produtoRepository->nullifyProdutoIdOnParcelas((int) $id);

            return parent::delete($id);
        });
    }
}
