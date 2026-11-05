<?php

namespace App\Ai\Copiloto;

use App\Ai\Agents\Copiloto;
use App\Ai\Contracts\CopilotoAgenteInterface;
use App\DTO\CopilotoContextoDTO;
use App\DTO\CopilotoRespostaDTO;
use App\Models\User;

/**
 * Única implementação que conhece o laravel/ai. A conversa fica nas tabelas do SDK (agent_conversations).
 */
class LaravelAiCopilotoAgente implements CopilotoAgenteInterface
{
    public function responder(string $mensagem, ?string $conversaId, CopilotoContextoDTO $contexto, User $user): CopilotoRespostaDTO
    {
        $agente = new Copiloto($contexto);
        $agente = $conversaId !== null
            ? $agente->continue($conversaId, as: $user)
            : $agente->forUser($user);

        $resposta = $agente->prompt($mensagem);

        return new CopilotoRespostaDTO(
            conversaId: (string) $resposta->conversationId,
            resposta: trim((string) ($resposta['resposta'] ?? '')),
            respondeu: (bool) ($resposta['respondeu'] ?? false),
        );
    }
}
