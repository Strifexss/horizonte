<?php

namespace App\Http\Controllers;

use App\Exceptions\LimiteDeAnalisesException;
use App\Http\Requests\GerarInsightsRequest;
use App\Http\Requests\InsightAcaoRequest;
use App\Services\Interfaces\DashboardInsightsServiceInterface;
use Illuminate\Http\Request;

class DashboardInsightsController extends Controller
{
    public function __construct(
        private DashboardInsightsServiceInterface $dashboardInsightsService
    ) {}

    public function store(GerarInsightsRequest $request)
    {
        try {
            $this->dashboardInsightsService->gerar(
                (int) $request->user()->id,
                (int) $request->validated('ano'),
                (int) $request->validated('mes'),
                (bool) $request->validated('forcar'),
            );

            return redirect()->back();
        } catch (LimiteDeAnalisesException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function acaoStore(InsightAcaoRequest $request, $id)
    {
        $this->dashboardInsightsService->registrarAcao(
            (int) $id,
            (int) $request->user()->id,
            (string) $request->validated('chave'),
            (string) $request->validated('acao'),
            $request->validated('motivo'),
        );

        return redirect()->back();
    }

    public function acaoDestroy(Request $request, $id, string $chave)
    {
        $this->dashboardInsightsService->desfazerAcao((int) $id, (int) $request->user()->id, $chave);

        return redirect()->back();
    }
}
