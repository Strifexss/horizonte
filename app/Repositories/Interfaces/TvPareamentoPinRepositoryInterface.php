<?php

namespace App\Repositories\Interfaces;

use App\Models\TvPareamentoPin;

interface TvPareamentoPinRepositoryInterface extends AbstractRepositoryInterface
{
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

    /**
     * Apaga os PINs usados ou expirados, liberando os códigos para novos pareamentos.
     */
    public function liberarPinsVencidos(): int;

    /**
     * Consome o PIN se ele ainda estiver válido. Retorna false quando outro pareamento já o consumiu.
     */
    public function marcarUsado(int $id): bool;
}
