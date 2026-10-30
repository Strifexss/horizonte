<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmpresa
{
    /**
     * Toda conta trabalha dentro de uma Empresa: sem ela, o usuário vai para o onboarding.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->empresa() === null) {
            return to_route('onboarding');
        }

        return $next($request);
    }
}
