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
     * Só a conta com senha do e-mail autorizado é Administrador; a conta Google de mesmo e-mail não.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if (! $usuario || $usuario->ehContaGoogle() || ! $this->usuariosService->isAdministrador($usuario->email)) {
            abort(404);
        }

        return $next($request);
    }
}
