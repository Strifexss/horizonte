<?php

namespace App\DTO;

class CopilotoMensagemDTO extends Dto
{
    public string $mensagem = '';

    /** Componente Inertia aberto quando a pergunta foi feita (só dica para o modelo). */
    public ?string $componente = null;

    public ?string $conversa_id = null;
}
