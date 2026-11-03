<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Landing page pública; quem já está logado vai direto para o Início.
 */
class LandingController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if ($request->user()) {
            return to_route('inicio');
        }

        return Inertia::render('landing/index', [
            'links' => [
                'entrar' => route('login'),
                'criarConta' => route('register'),
            ],
        ]);
    }
}
