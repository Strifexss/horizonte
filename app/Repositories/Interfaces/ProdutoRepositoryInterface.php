<?php

namespace App\Repositories\Interfaces;

interface ProdutoRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Remove o vínculo de produto nas parcelas vinculadas.
     */
    public function nullifyProdutoIdOnParcelas(int $produtoId): int;
}
