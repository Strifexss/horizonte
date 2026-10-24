<?php

namespace App\Http\Controllers;

use App\Exceptions\PinPareamentoInvalidoException;
use App\Http\Requests\ParearTvRequest;
use App\Http\Resources\TvBoardResource;
use App\Services\Interfaces\MenuBoardsServiceInterface;
use App\Services\Interfaces\TvPareamentoServiceInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Modo Exibição da TV: rota pública, identificada pelo cookie do dispositivo pareado.
 */
class TvController extends Controller
{
    public const COOKIE_DISPOSITIVO = 'horizonte_tv';

    private const VALIDADE_COOKIE_MINUTOS = 60 * 24 * 365;

    public function __construct(
        private TvPareamentoServiceInterface $tvPareamentoService,
        private MenuBoardsServiceInterface $menuBoardsService,
    ) {}

    public function show(Request $request)
    {
        $dispositivo = $this->tvPareamentoService->resolverDispositivo($request->cookie(self::COOKIE_DISPOSITIVO));

        if (! $dispositivo) {
            return Inertia::render('tv/pareamento');
        }

        $board = $this->menuBoardsService->findAtivoDoUsuario($dispositivo->usuario_id);

        return Inertia::render('tv/board', [
            'board' => $board ? TvBoardResource::make($board)->resolve() : null,
            'sincronizado_em' => now()->toIso8601String(),
        ]);
    }

    public function parear(ParearTvRequest $request)
    {
        try {
            $token = $this->tvPareamentoService->parear($request->validated('pin'));

            return redirect()->route('tv')->withCookie(cookie(
                self::COOKIE_DISPOSITIVO,
                $token,
                self::VALIDADE_COOKIE_MINUTOS,
                httpOnly: true,
                sameSite: 'lax',
            ));
        } catch (PinPareamentoInvalidoException $e) {
            return redirect()->back()->withErrors(['pin' => $e->getMessage()]);
        }
    }
}
