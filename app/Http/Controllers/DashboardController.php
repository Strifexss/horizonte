<?php

namespace App\Http\Controllers;

use App\DTO\DashboardSearchDTO;
use App\Http\Requests\DashboardSearchRequest;
use App\Http\Resources\DashboardAnaliseResource;
use App\Services\Interfaces\DashboardInsightsServiceInterface;
use App\Services\Interfaces\DashboardServiceInterface;
use App\Services\Interfaces\ExtratoServiceInterface;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardServiceInterface $dashboardService,
        private ExtratoServiceInterface $extratoService,
        private DashboardInsightsServiceInterface $dashboardInsightsService,
    ) {}

    public function index(DashboardSearchRequest $request): Response
    {
        $filtros = $this->dashboardService->resolverFiltros(
            DashboardSearchDTO::fromArray($request->validated())
        );

        return Inertia::render('dashboard/index', [
            'ano' => $filtros->ano,
            'mes' => $filtros->mes,
            'anos' => $this->dashboardService->anosDisponiveis(),
            'semana' => $filtros->semana,
            'semanas' => $this->dashboardService->semanasQueCruzamOMes($filtros),
            'rankingCriterio' => $filtros->ranking_criterio,
            'resumo' => Inertia::defer(fn (): array => $this->extratoService
                ->resumo($this->dashboardService->filtrosDoResumoNoMes($filtros)), 'resumo'),
            'seriesMensais' => Inertia::defer(fn (): array => $this->dashboardService
                ->seriesMensaisDoAno((int) $filtros->ano), 'seriesMensais'),
            'despesasPorCategoria' => Inertia::defer(fn (): array => $this->dashboardService
                ->despesasPorCategoriaNoPeriodo($filtros), 'despesasPorCategoria'),
            'despesasPorGrupoDeProduto' => Inertia::defer(fn (): array => $this->dashboardService
                ->despesasPorGrupoDeProdutoNoPeriodo($filtros), 'despesasPorGrupoDeProduto'),
            'receitasPorDiaDaSemana' => Inertia::defer(fn (): array => $this->dashboardService
                ->receitasPorDiaDaSemana($filtros), 'receitasPorDiaDaSemana'),
            'ranking' => Inertia::defer(fn (): array => $this->dashboardService
                ->rankingNoPeriodo($filtros), 'ranking'),
            'insights' => Inertia::optional(function () use ($request, $filtros): ?array {
                $analise = $this->dashboardInsightsService->analiseDoPeriodo((int) $request->user()->id, (int) $filtros->ano, (int) $filtros->mes);

                return $analise ? DashboardAnaliseResource::make($analise)->resolve() : null;
            }),
        ]);
    }
}
