<?php

namespace App\Repositories\Interfaces;

interface ContaRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Remove o flag padrao das demais contas do usuário.
     */
    public function clearPadraoForUsuario(int $usuarioId, ?int $exceptId = null): int;
}
