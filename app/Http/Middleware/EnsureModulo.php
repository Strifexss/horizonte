<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModulo
{
    /**
     * Módulo indisponível para a Empresa ativa responde 404, como se a tela não existisse.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $modulo): Response
    {
        if (! $request->user()?->empresa()?->podeUsar($modulo)) {
            abort(404);
        }

        return $next($request);
    }
}
