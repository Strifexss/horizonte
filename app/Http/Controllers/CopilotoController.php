<?php

namespace App\Http\Controllers;

use App\DTO\CopilotoMensagemDTO;
use App\Exceptions\CopilotoOcupadoException;
use App\Http\Requests\CopilotoAberturaRequest;
use App\Http\Requests\CopilotoInteresseRequest;
use App\Http\Requests\CopilotoMensagemRequest;
use App\Services\Interfaces\CopilotoServiceInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * O chat é um painel sobre qualquer tela, não uma página: as rotas respondem JSON.
 */
class CopilotoController extends Controller
{
    public function __construct(
        private CopilotoServiceInterface $copilotoService
    ) {}

    public function abertura(CopilotoAberturaRequest $request): JsonResponse
    {
        return response()->json($this->copilotoService->abertura($request->user(), $request->validated('componente')));
    }

    public function store(CopilotoMensagemRequest $request): JsonResponse
    {
        try {
            return response()->json(
                $this->copilotoService->perguntar(CopilotoMensagemDTO::fromArray($request->validated()), $request->user())
            );
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (CopilotoOcupadoException $e) {
            return response()->json(['message' => $e->getMessage()], 429);
        } catch (Throwable $e) {
            Log::error('Copiloto: falha ao responder', ['erro' => $e->getMessage()]);

            return response()->json(['message' => 'Não consegui responder agora. Tente de novo em instantes.'], 503);
        }
    }

    public function destroy(): JsonResponse
    {
        $this->copilotoService->novaConversa(request()->user());

        return response()->json(['ok' => true]);
    }

    public function interesse(CopilotoInteresseRequest $request): JsonResponse
    {
        return response()->json($this->copilotoService->registrarInteresse($request->user(), $request->validated('modulo')));
    }
}
