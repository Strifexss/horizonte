<?php

namespace App\Repositories\Interfaces;

interface FornecedorRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Remove vínculo de fornecedor em produtos (seta fornecedor_id null).
     */
    public function nullifyFornecedorIdOnProdutos(int $fornecedorId): int;

    /**
     * Apaga todos os fornecedores do usuário (a coluna usuario_id não tem cascata).
     */
    public function deleteByUsuario(int $usuarioId): int;

    /**
     * Conta quantos fornecedores um usuário possui.
     */
    public function countByUsuario(int $usuarioId): int;

    /**
     * Retorna todos os fornecedores do usuário.
     *
     * @return mixed
     */
    public function getByUsuario(int $usuarioId);
}
