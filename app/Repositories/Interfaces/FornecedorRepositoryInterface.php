<?php

namespace App\Repositories\Interfaces;

interface FornecedorRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Remove vínculo de fornecedor em produtos (seta fornecedor_id null).
     */
    public function nullifyFornecedorIdOnProdutos(int $fornecedorId): int;

    /**
     * Apaga todos os fornecedores da Empresa.
     */
    public function deleteByEmpresa(int $empresaId): int;

    /**
     * Conta quantos fornecedores um usuário possui.
     */
    public function countByEmpresa(int $empresaId): int;

    /**
     * Retorna todos os fornecedores do usuário.
     *
     * @return mixed
     */
    public function getByEmpresa(int $empresaId);
}
