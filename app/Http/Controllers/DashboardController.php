<?php

namespace App\Http\Controllers;

use App\DTO\DashboardSearchDTO;
use App\Http\Requests\DashboardSearchRequest;
use App\Services\Interfaces\DashboardServiceInterface;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardServiceInterface $dashboardService
    ) {}

    public function index(DashboardSearchRequest $request): Response
    {
        $filtros = $this->dashboardService->resolverFiltros(
            DashboardSearchDTO::fromArray($request->validated())
        );
        $ano = $this->dashboardService->anoVigente();

        return Inertia::render('dashboard/index', [
            'ano' => $ano,
            'saldos' => Inertia::defer(fn (): array => $this->dashboardService->saldosDoAno($ano)),
            'dataInicioDespesasPorCategoria' => $filtros->data_inicio,
            'dataFimDespesasPorCategoria' => $filtros->data_fim,
            'despesasPorCategoria' => Inertia::defer(fn (): array => $this->dashboardService
                ->despesasPorCategoriaNoPeriodo($filtros)),
            'dataInicioDespesasPorGrupo' => $filtros->grupo_data_inicio,
            'dataFimDespesasPorGrupo' => $filtros->grupo_data_fim,
            'despesasPorGrupoDeProduto' => Inertia::defer(fn (): array => $this->dashboardService
                ->despesasPorGrupoDeProdutoNoPeriodo($filtros)),
            'mesReceitas' => $filtros->mes_receitas,
            'semanaReceitas' => $filtros->semana_receitas,
            'semanasReceitas' => $this->dashboardService->semanasQueCruzamOMes($filtros),
            'receitasPorDiaDaSemana' => Inertia::defer(fn (): array => $this->dashboardService
                ->receitasPorDiaDaSemana($filtros)),
        ]);
    }
}
