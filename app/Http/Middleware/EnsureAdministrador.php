<?php

namespace App\Http\Middleware;

use App\Services\Interfaces\UsuariosServiceInterface;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdministrador
{
    public function __construct(
        private UsuariosServiceInterface $usuariosService
    ) {}

    /**
     * Responde 404 para quem não é Administrador, escondendo a existência do painel.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->usuariosService->isAdministrador($request->user()?->email)) {
            abort(404);
        }

        return $next($request);
    }
}
