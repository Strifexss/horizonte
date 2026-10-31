<?php

namespace App\Repositories\Interfaces;

use Illuminate\Support\Collection;

interface SegmentoRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Segmentos que aparecem no onboarding.
     */
    public function ativos(): Collection;

    public function chaveEmUso(string $chave): bool;

    public function contarEmpresas(int $id): int;
}
