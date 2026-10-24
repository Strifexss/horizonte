<?php

namespace App\Services\Interfaces;

use App\DTO\VendaSearchDTO;
use App\Models\Produto;
use App\Models\Venda;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface VendasServiceInterface extends AbstractServiceInterface
{
    public function indexFiltrado(VendaSearchDTO $filters): LengthAwarePaginator;

    /**
     * @return Collection<int, Produto>
     */
    public function produtosParaVenda(?string $q = null): Collection;

    /**
     * Marca a venda como cancelada e exclui as receitas que ela gerou.
     */
    public function cancelar(int $id): Venda;
}
