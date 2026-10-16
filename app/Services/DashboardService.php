<?php

namespace App\Services;

use App\DTO\DashboardSearchDTO;
use App\DTO\FinanceiroSearchDTO;
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

    private const LIMITE_RANKING = 5;

    public function __construct(
        private FinanceiroRepositoryInterface $financeiroRepository
    ) {
        parent::__construct($financeiroRepository);
    }

    public function anosDisponiveis(): array
    {
        $anoAtual = (int) now()->year;

        return range($anoAtual - DashboardSearchDTO::ANOS_ANTES, $anoAtual + DashboardSearchDTO::ANOS_DEPOIS);
    }

    public function resolverFiltros(DashboardSearchDTO $filtros): DashboardSearchDTO
    {
        $ano = $filtros->ano ?? (int) now()->year;
        $mes = $filtros->mes ?? (int) now()->month;

        return DashboardSearchDTO::fromArray([
            'ano' => $ano,
            'mes' => $mes,
            'semana' => $filtros->semana ?? $this->semanaPadraoDoMes($ano, $mes),
            'ranking_criterio' => $filtros->ranking_criterio ?? DashboardSearchDTO::CRITERIOS_RANKING[0],
        ]);
    }

    public function filtrosDoResumoNoMes(DashboardSearchDTO $filtros): FinanceiroSearchDTO
    {
        return FinanceiroSearchDTO::fromArray([
            'tipo_data' => 'competencia',
            'data_inicio' => $this->inicioDoMes($filtros)->toDateString(),
            'data_fim' => $this->inicioDoMes($filtros)->endOfMonth()->toDateString(),
        ]);
    }

    public function seriesMensaisDoAno(int $ano): array
    {
        $receitasPorMes = $this->financeiroRepository
            ->receitasMensaisPorCompetencia($ano)
            ->keyBy(fn ($linha): int => (int) $linha->mes);
        $despesasPorMes = $this->financeiroRepository
            ->despesasMensaisPorCompetencia($ano)
            ->keyBy(fn ($linha): int => (int) $linha->mes);

        $receitas = [];
        $despesas = [];
        $saldos = [];

        for ($mes = 1; $mes <= 12; $mes++) {
            $receita = round((float) ($receitasPorMes->get($mes)->valor ?? 0), 2);
            $despesa = round((float) ($despesasPorMes->get($mes)->valor ?? 0), 2);

            $receitas[] = [
                'mes' => $mes,
                'rotulo' => self::ROTULOS[$mes],
                'valor' => $receita,
            ];
            $despesas[] = [
                'mes' => $mes,
                'rotulo' => self::ROTULOS[$mes],
                'valor' => $despesa,
            ];
            $saldos[] = [
                'mes' => $mes,
                'rotulo' => self::ROTULOS[$mes],
                'saldo' => round($receita - $despesa, 2),
            ];
        }

        return [
            'receitas' => $receitas,
            'despesas' => $despesas,
            'saldos' => $saldos,
        ];
    }

    public function despesasPorCategoriaNoPeriodo(DashboardSearchDTO $filtros): array
    {
        $linhas = $this->financeiroRepository
            ->despesasPorCategoriaNoPeriodo(
                $this->inicioDoMes($filtros)->toDateString(),
                $this->inicioDoMes($filtros)->endOfMonth()->toDateString(),
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

    public function despesasPorGrupoDeProdutoNoPeriodo(DashboardSearchDTO $filtros): array
    {
        $linhas = $this->financeiroRepository
            ->despesasPorGrupoDeProdutoNoPeriodo(
                $this->inicioDoMes($filtros)->toDateString(),
                $this->inicioDoMes($filtros)->endOfMonth()->toDateString(),
            );

        $resultado = [];

        foreach ($linhas as $linha) {
            $resultado[] = [
                'grupo' => (string) ($linha->grupo ?? 'Sem grupo'),
                'valor' => round((float) ($linha->valor ?? 0), 2),
            ];
        }

        return $resultado;
    }

    public function rankingNoPeriodo(DashboardSearchDTO $filtros): array
    {
        $criterio = (string) $filtros->ranking_criterio;
        $linhas = $this->financeiroRepository->rankingNoPeriodo(
            $criterio,
            $this->inicioDoMes($filtros)->toDateString(),
            $this->inicioDoMes($filtros)->endOfMonth()->toDateString(),
        );

        $total = round((float) $linhas->sum(fn ($linha): float => (float) $linha->valor), 2);
        $itens = [];

        foreach ($linhas->take(self::LIMITE_RANKING)->values() as $indice => $linha) {
            $valor = round((float) $linha->valor, 2);

            $itens[] = [
                'posicao' => $indice + 1,
                'nome' => (string) $linha->nome,
                'valor' => $valor,
                'lancamentos' => (int) $linha->lancamentos,
                'percentual' => $total > 0 ? round($valor / $total * 100, 2) : 0.0,
            ];
        }

        return [
            'criterio' => $criterio,
            'total' => $total,
            'itens' => $itens,
        ];
    }

    public function semanasQueCruzamOMes(DashboardSearchDTO $filtros): array
    {
        $inicioMes = $this->inicioDoMes($filtros);
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
        $inicio = Carbon::parse((string) $filtros->semana)->startOfWeek(Carbon::MONDAY)->startOfDay();
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

    private function inicioDoMes(DashboardSearchDTO $filtros): Carbon
    {
        return Carbon::create((int) $filtros->ano, (int) $filtros->mes, 1)->startOfDay();
    }

    private function semanaPadraoDoMes(int $ano, int $mes): string
    {
        $inicioMes = Carbon::create($ano, $mes, 1)->startOfDay();

        if ($inicioMes->isSameMonth(now())) {
            return now()->startOfWeek(Carbon::MONDAY)->toDateString();
        }

        return $inicioMes->startOfWeek(Carbon::MONDAY)->toDateString();
    }
}
