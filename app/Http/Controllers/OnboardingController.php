<?php

namespace App\Http\Controllers;

use App\Http\Requests\OnboardingRequest;
use App\Services\Interfaces\EmpresasServiceInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function __construct(
        private EmpresasServiceInterface $empresasService
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()->empresa() !== null) {
            return to_route('dashboard');
        }

        return Inertia::render('onboarding/index');
    }

    public function store(OnboardingRequest $request): RedirectResponse
    {
        if ($request->user()->empresa() !== null) {
            return to_route('dashboard');
        }

        $this->empresasService->criarNoOnboarding($request->user(), $request->validated('nome'), $request->validated('modulo'));

        return to_route('dashboard');
    }
}
