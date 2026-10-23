<?php

namespace App\Services\Interfaces;

use App\DTO\ProdutoSearchDTO;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProdutosServiceInterface extends AbstractServiceInterface
{
    public function indexFiltrado(ProdutoSearchDTO $filters): LengthAwarePaginator;
}
