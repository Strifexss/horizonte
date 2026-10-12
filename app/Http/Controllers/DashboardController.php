<?php

namespace App\Http\Controllers;

use App\Services\Interfaces\DashboardServiceInterface;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardServiceInterface $dashboardService
    ) {}

    public function index(): Response
    {
        $ano = $this->dashboardService->anoVigente();

        return Inertia::render('dashboard', [
            'ano' => $ano,
            'saldos' => Inertia::defer(fn (): array => $this->dashboardService->saldosDoAno($ano)),
        ]);
    }
}
