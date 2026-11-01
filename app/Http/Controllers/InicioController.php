<?php

namespace App\Http\Controllers;

use App\Http\Resources\FinanceiroParcelaResource;
use App\Services\Interfaces\InicioServiceInterface;
use Inertia\Inertia;
use Inertia\Response;

class InicioController extends Controller
{
    public function __construct(
        private InicioServiceInterface $inicioService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('inicio/index', [
            'primeirosPassos' => $this->inicioService->primeirosPassos(),
            'resumo' => Inertia::defer(fn (): array => $this->inicioService->resumo(), 'resumo'),
            'ultimosLancamentos' => Inertia::defer(fn (): array => FinanceiroParcelaResource::collection($this->inicioService->ultimosLancamentos())->resolve(), 'ultimosLancamentos'),
        ]);
    }
}
