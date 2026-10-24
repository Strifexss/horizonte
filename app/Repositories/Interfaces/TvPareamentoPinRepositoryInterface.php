<?php

namespace App\Repositories\Interfaces;

use App\Models\TvPareamentoPin;

interface TvPareamentoPinRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Indica se o PIN já está em uso por algum pareamento válido.
     */
    public function existeValido(string $pin): bool;

    /**
     * PIN válido (não usado e não expirado) com o código informado.
     */
    public function findValido(string $pin): ?TvPareamentoPin;

    /**
     * PIN válido mais recente do usuário.
     */
    public function findValidoDoUsuario(int $usuarioId): ?TvPareamentoPin;

    /**
     * Expira os PINs ainda válidos do usuário.
     */
    public function invalidarDoUsuario(int $usuarioId): int;

    public function marcarUsado(int $id): void;
}
