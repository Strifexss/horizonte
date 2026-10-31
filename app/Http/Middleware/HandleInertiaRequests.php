<?php

namespace App\Http\Middleware;

use App\Http\Resources\NovidadeUsuarioResource;
use App\Services\Interfaces\NovidadesServiceInterface;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function __construct(
        private NovidadesServiceInterface $novidadesService
    ) {}

    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'conta_google' => (bool) $request->user()?->ehContaGoogle(),
            ],
            'empresa' => fn () => $this->empresaAtiva($request),
            'admin_navegacao' => fn () => $request->routeIs('admin.*') ? [
                'usuarios' => route('admin.usuarios'),
                'empresas' => route('admin.empresas'),
                'segmentos' => route('admin.segmentos'),
                'novidades' => route('admin.novidades'),
            ] : null,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'warning' => session('warning'),
                'produto_criado' => session('produto_criado'),
                'funcionario_criado' => session('funcionario_criado'),
                'categoria_criada' => session('categoria_criada'),
                'grupo_criado' => session('grupo_criado'),
                'fornecedor_criado' => session('fornecedor_criado'),
                'forma_pagamento_criada' => session('forma_pagamento_criada'),
            ],
            'novidades_pendentes' => fn () => $request->user()
                ? NovidadeUsuarioResource::collection($this->novidadesService->pendentesPopup($request->user()->id))->resolve()
                : [],
            'novidades' => Inertia::optional(fn () => $request->user()
                ? NovidadeUsuarioResource::collection($this->novidadesService->historicoDoUsuario($request->user()->id))->resolve()
                : []),
        ];
    }

    /**
     * @return array{id: int, nome: string, segmento: ?string, modulos: list<string>, nome_confirmado: bool}|null
     */
    private function empresaAtiva(Request $request): ?array
    {
        $empresa = $request->user()?->empresa();

        if ($empresa === null) {
            return null;
        }

        return [
            'id' => $empresa->id,
            'nome' => $empresa->nome,
            'segmento' => $empresa->segmento?->nome,
            'modulos' => $empresa->modulosDisponiveis(),
            'nome_confirmado' => $empresa->nomeConfirmado(),
        ];
    }
}
