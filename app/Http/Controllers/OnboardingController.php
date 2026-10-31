<?php

namespace App\Http\Controllers;

use App\Http\Requests\OnboardingRequest;
use App\Http\Resources\SegmentoResource;
use App\Services\Interfaces\EmpresasServiceInterface;
use App\Services\Interfaces\SegmentosServiceInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function __construct(
        private EmpresasServiceInterface $empresasService,
        private SegmentosServiceInterface $segmentosService
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()->empresa() !== null) {
            return to_route('dashboard');
        }

        return Inertia::render('onboarding/index', [
            'segmentos' => SegmentoResource::collection($this->segmentosService->ativos())->resolve(),
        ]);
    }

    public function store(OnboardingRequest $request): RedirectResponse
    {
        if ($request->user()->empresa() !== null) {
            return to_route('dashboard');
        }

        $this->empresasService->criarNoOnboarding($request->user(), $request->validated('nome'), (int) $request->validated('segmento_id'));

        return to_route('dashboard');
    }
}
