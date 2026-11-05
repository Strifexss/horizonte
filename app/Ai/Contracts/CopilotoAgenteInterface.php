<?php

namespace App\Ai\Contracts;

use App\DTO\CopilotoContextoDTO;
use App\DTO\CopilotoRespostaDTO;
use App\Models\User;

/**
 * Quem responde as perguntas do Copiloto. O CopilotoService só conhece este contrato;
 * trocar de provedor ou de SDK é trocar o bind no AppServiceProvider.
 */
interface CopilotoAgenteInterface
{
    /**
     * @param  string|null  $conversaId  conversa já conferida como do usuário; null começa uma nova
     */
    public function responder(string $mensagem, ?string $conversaId, CopilotoContextoDTO $contexto, User $user): CopilotoRespostaDTO;
}
