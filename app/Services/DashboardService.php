<?php

namespace App\Services;

use App\DTO\DashboardSearchDTO;
use App\Repositories\Interfaces\FinanceiroRepositoryInterface;
use App\Services\Interfaces\DashboardServiceInterface;
use Carbon\Carbon;

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

    /**
     * @var array<int, string>
     */
    private const DIAS = [
        1 => 'Seg',
        2 => 'Ter',
        3 => 'Qua',
        4 => 'Qui',
        5 => 'Sex',
        6 => 'Sáb',
        7 => 'Dom',
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

    public function resolverFiltros(DashboardSearchDTO $filtros): DashboardSearchDTO
    {
        $mesReceitas = $filtros->mes_receitas ?? now()->format('Y-m');

        return DashboardSearchDTO::fromArray([
            'data_inicio' => $filtros->data_inicio ?? now()->startOfMonth()->toDateString(),
            'data_fim' => $filtros->data_fim ?? now()->endOfMonth()->toDateString(),
            'mes_receitas' => $mesReceitas,
            'semana_receitas' => $filtros->semana_receitas ?? $this->semanaPadraoDoMes($mesReceitas),
        ]);
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

    public function despesasPorCategoriaNoPeriodo(DashboardSearchDTO $filtros): array
    {
        $linhas = $this->financeiroRepository
            ->despesasPorCategoriaNoPeriodo(
                (string) $filtros->data_inicio,
                (string) $filtros->data_fim,
            );

        $resultado = [];

        foreach ($linhas as $linha) {
            $resultado[] = [
                'categoria' => (string) ($linha->categoria ?? 'Sem categoria'),
                'valor' => round((float) ($linha->valor ?? 0), 2),
            ];
        }

        return $resultado;
    }

    public function semanasQueCruzamOMes(DashboardSearchDTO $filtros): array
    {
        $inicioMes = Carbon::createFromFormat('!Y-m', (string) $filtros->mes_receitas);

        if ($inicioMes === false) {
            return [];
        }

        $inicioMes = $inicioMes->startOfMonth();
        $fimMes = $inicioMes->copy()->endOfMonth();
        $cursor = $inicioMes->copy()->startOfWeek(Carbon::MONDAY);
        $semanas = [];

        while ($cursor->lte($fimMes)) {
            $fimSemana = $cursor->copy()->endOfWeek(Carbon::SUNDAY);
            $semanas[] = [
                'inicio' => $cursor->toDateString(),
                'fim' => $fimSemana->toDateString(),
                'rotulo' => $cursor->format('d/m').' – '.$fimSemana->format('d/m'),
            ];
            $cursor->addWeek();
        }

        return $semanas;
    }

    public function receitasPorDiaDaSemana(DashboardSearchDTO $filtros): array
    {
        $inicio = Carbon::parse((string) $filtros->semana_receitas)->startOfWeek(Carbon::MONDAY)->startOfDay();
        $fim = $inicio->copy()->endOfWeek(Carbon::SUNDAY)->toDateString();

        $somas = $this->financeiroRepository
            ->receitasPorDiaDaSemanaNoPeriodo($inicio->toDateString(), $fim)
            ->keyBy(fn ($linha): int => (int) $linha->dia);

        $receitas = [];

        for ($dia = 1; $dia <= 7; $dia++) {
            $linha = $somas->get($dia);
            $receitas[] = [
                'dia' => $dia,
                'rotulo' => self::DIAS[$dia],
                'valor' => round((float) ($linha->valor ?? 0), 2),
            ];
        }

        return $receitas;
    }

    private function semanaPadraoDoMes(string $mes): string
    {
        if ($mes === now()->format('Y-m')) {
            return now()->startOfWeek(Carbon::MONDAY)->toDateString();
        }

        if (preg_match('/^\d{4}-\d{2}$/', $mes) !== 1) {
            return now()->startOfWeek(Carbon::MONDAY)->toDateString();
        }

        $inicioMes = Carbon::createFromFormat('!Y-m', $mes);

        if ($inicioMes === false) {
            return now()->startOfWeek(Carbon::MONDAY)->toDateString();
        }

        return $inicioMes->startOfMonth()->startOfWeek(Carbon::MONDAY)->toDateString();
    }
}
