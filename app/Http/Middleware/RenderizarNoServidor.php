<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Liga o SSR do Inertia só na rota que o usa (a Landing page); o resto do sistema segue renderizado no navegador.
 * Sem o servidor SSR rodando, o Inertia cai sozinho para a renderização no navegador.
 */
class RenderizarNoServidor
{
    public function handle(Request $request, Closure $next): Response
    {
        config(['inertia.ssr.enabled' => true]);

        return $next($request);
    }
}
