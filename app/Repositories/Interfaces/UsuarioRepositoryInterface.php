<?php

namespace App\Repositories\Interfaces;

interface UsuarioRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Apaga as sessões gravadas do usuário, exceto a sessão informada.
     */
    public function encerrarSessoes(int $usuarioId, ?string $excetoSessaoId = null): int;
}
