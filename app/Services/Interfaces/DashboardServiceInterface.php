<?php

namespace App\Services\Interfaces;

interface DashboardServiceInterface extends AbstractServiceInterface
{
    public function anoVigente(): int;

    /**
     * Saldo de cada mês do ano: valor das receitas menos valor das despesas,
     * pela data de competência, sem filtrar status nem conta.
     *
     * @return list<array{mes: int, rotulo: string, saldo: float}>
     */
    public function saldosDoAno(int $ano): array;
}
