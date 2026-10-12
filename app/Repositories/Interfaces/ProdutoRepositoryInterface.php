<?php

namespace App\Repositories\Interfaces;

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
}
