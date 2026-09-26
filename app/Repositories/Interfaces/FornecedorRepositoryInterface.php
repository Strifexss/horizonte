<?php

namespace App\Repositories\Interfaces;

interface FornecedorRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Remove vínculo de fornecedor em produtos (seta fornecedor_id null).
     */
    public function nullifyFornecedorIdOnProdutos(int $fornecedorId): int;
}

