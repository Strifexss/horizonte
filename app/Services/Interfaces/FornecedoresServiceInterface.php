<?php

namespace App\Services\Interfaces;

interface FornecedoresServiceInterface extends AbstractServiceInterface
{
    /**
     * Apaga todos os fornecedores do usuário.
     */
    public function deleteByEmpresa(int $empresaId): int;
}
