<?php

namespace App\Http\Controllers;

use App\DTO\ConfiguracoesDTO;
use App\Http\Requests\ConfiguracoesRequest;
use App\Modulos;
use App\Services\Interfaces\ConfiguracoesServiceInterface;
use App\Services\Interfaces\CopilotoServiceInterface;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracoesController extends Controller
{
    public function __construct(
        private ConfiguracoesServiceInterface $configuracoesService,
        private CopilotoServiceInterface $copilotoService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('admin/configuracoes/index', [
            'urls' => ['update' => route('admin.configuracoes.update')],
            'configuracoes' => [
                'suporte_whatsapp' => $this->configuracoesService->whatsappSuporte(),
            ],
            'perguntas_sem_resposta' => Inertia::defer(fn () => $this->copilotoService->perguntasSemResposta()),
            'interesses' => Inertia::defer(fn () => $this->copilotoService->interesses()->map(fn (object $interesse): object => (object) [
                ...(array) $interesse,
                'modulo' => Modulos::OPCIONAIS[$interesse->modulo]['nome'] ?? $interesse->modulo,
            ])),
        ]);
    }

    public function update(ConfiguracoesRequest $request): RedirectResponse
    {
        $this->configuracoesService->atualizar(ConfiguracoesDTO::fromArray($request->validated()));

        return redirect()->route('admin.configuracoes')->with('success', 'Configurações salvas.');
    }
}
