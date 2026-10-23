<?php

namespace App\Repositories\Interfaces;

use App\DTO\ProdutoSearchDTO;
use App\Models\Produto;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface ProdutoRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Remove o vínculo de produto nas parcelas vinculadas.
     */
    public function nullifyProdutoIdOnParcelas(int $produtoId): int;

    /**
     * Conta quantos produtos um usuário possui.
     */
    public function countByUsuario(int $usuarioId): int;

    /**
     * Retorna todos os produtos de um usuário (sem paginação).
     *
     * @return Collection|array
     */
    public function getByUsuario(int $usuarioId): mixed;

    public function findForUsuario(int $id): Produto;

    public function countParcelasByProdutoId(int $produtoId): int;

    public function indexFiltrado(ProdutoSearchDTO $filters): LengthAwarePaginator;
}
