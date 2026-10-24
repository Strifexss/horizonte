<?php

namespace App\Repositories\Interfaces;

use App\Models\Conta;

interface ContaRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Remove o flag padrao das demais contas do usuário.
     */
    public function clearPadraoForUsuario(int $usuarioId, ?int $exceptId = null): int;

    /**
     * Conta marcada como padrão do usuário; sem padrão, a primeira cadastrada.
     */
    public function padraoDoUsuario(int $usuarioId): ?Conta;
}
