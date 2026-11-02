<?php

namespace App\Services\Interfaces;

use App\DTO\VendaSearchDTO;
use App\Models\Produto;
use App\Models\Venda;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Database\Eloquent\Collection;

interface VendasServiceInterface extends AbstractServiceInterface
{
    public function indexFiltrado(VendaSearchDTO $filters): LengthAwarePaginator;

    /**
     * @return array{todos: int, aberta: int, fechada: int, cancelada: int}
     */
    public function contagemPorStatus(VendaSearchDTO $filters): array;

    /**
     * @return Collection<int, Produto>
     */
    public function produtosParaVenda(?string $q = null): Collection;

    public function catalogoParaVenda(?string $q, ?int $grupoId, bool $soFavoritos, int $page): Paginator;

    /**
     * Produtos ativos favoritos da Empresa, atalhos no topo da Nova Venda.
     *
     * @return Collection<int, Produto>
     */
    public function favoritosParaVenda(): Collection;

    /**
     * Marca a venda como cancelada e exclui as receitas que ela gerou.
     */
    public function cancelar(int $id): Venda;
}
