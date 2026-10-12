<?php

namespace App\Services;

use App\Repositories\Interfaces\FinanceiroRepositoryInterface;
use App\Services\Interfaces\DashboardServiceInterface;

class DashboardService extends ServiceAbstract implements DashboardServiceInterface
{
    /**
     * @var array<int, string>
     */
    private const ROTULOS = [
        1 => 'Jan',
        2 => 'Fev',
        3 => 'Mar',
        4 => 'Abr',
        5 => 'Mai',
        6 => 'Jun',
        7 => 'Jul',
        8 => 'Ago',
        9 => 'Set',
        10 => 'Out',
        11 => 'Nov',
        12 => 'Dez',
    ];

    public function __construct(
        private FinanceiroRepositoryInterface $financeiroRepository
    ) {
        parent::__construct($financeiroRepository);
    }

    public function anoVigente(): int
    {
        return (int) now()->year;
    }

    public function saldosDoAno(int $ano): array
    {
        $somas = $this->financeiroRepository
            ->somasMensaisPorCompetencia($ano)
            ->keyBy(fn ($linha): int => (int) $linha->mes);

        $saldos = [];

        for ($mes = 1; $mes <= 12; $mes++) {
            $linha = $somas->get($mes);
            $receitas = (float) ($linha->receitas ?? 0);
            $despesas = (float) ($linha->despesas ?? 0);

            $saldos[] = [
                'mes' => $mes,
                'rotulo' => self::ROTULOS[$mes],
                'saldo' => round($receitas - $despesas, 2),
            ];
        }

        return $saldos;
    }
}
