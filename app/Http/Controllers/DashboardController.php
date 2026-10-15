<?php

namespace App\Http\Controllers;

use App\DTO\DashboardSearchDTO;
use App\DTO\FinanceiroSearchDTO;
use App\Http\Requests\DashboardSearchRequest;
use App\Services\Interfaces\DashboardServiceInterface;
use App\Services\Interfaces\ExtratoServiceInterface;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardServiceInterface $dashboardService,
        private ExtratoServiceInterface $extratoService,
    ) {}

    public function index(DashboardSearchRequest $request): Response
    {
        $filtros = $this->dashboardService->resolverFiltros(
            DashboardSearchDTO::fromArray($request->validated())
        );
        $ano = $this->dashboardService->anoVigente();
        $filtrosExtrato = FinanceiroSearchDTO::fromArray([
            'tipo_data' => 'competencia',
            'data_inicio' => now()->startOfMonth()->toDateString(),
            'data_fim' => now()->endOfMonth()->toDateString(),
        ]);

        return Inertia::render('dashboard/index', [
            'ano' => $ano,
            'resumo' => Inertia::defer(fn (): array => $this->extratoService->resumo($filtrosExtrato), 'resumo'),
            'seriesMensais' => Inertia::defer(fn (): array => $this->dashboardService->seriesMensaisDoAno($ano), 'seriesMensais'),
            'dataInicioDespesasPorCategoria' => $filtros->data_inicio,
            'dataFimDespesasPorCategoria' => $filtros->data_fim,
            'despesasPorCategoria' => Inertia::defer(fn (): array => $this->dashboardService
                ->despesasPorCategoriaNoPeriodo($filtros), 'despesasPorCategoria'),
            'dataInicioDespesasPorGrupo' => $filtros->grupo_data_inicio,
            'dataFimDespesasPorGrupo' => $filtros->grupo_data_fim,
            'despesasPorGrupoDeProduto' => Inertia::defer(fn (): array => $this->dashboardService
                ->despesasPorGrupoDeProdutoNoPeriodo($filtros), 'despesasPorGrupoDeProduto'),
            'mesReceitas' => $filtros->mes_receitas,
            'semanaReceitas' => $filtros->semana_receitas,
            'semanasReceitas' => $this->dashboardService->semanasQueCruzamOMes($filtros),
            'receitasPorDiaDaSemana' => Inertia::defer(fn (): array => $this->dashboardService
                ->receitasPorDiaDaSemana($filtros), 'receitasPorDiaDaSemana'),
            'rankingCriterio' => $filtros->ranking_criterio,
            'dataInicioRanking' => $filtros->ranking_data_inicio,
            'dataFimRanking' => $filtros->ranking_data_fim,
            'ranking' => Inertia::defer(fn (): array => $this->dashboardService
                ->rankingNoPeriodo($filtros), 'ranking'),
        ]);
    }
}
