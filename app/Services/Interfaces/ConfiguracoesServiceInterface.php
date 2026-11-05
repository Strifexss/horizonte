<?php

namespace App\Services\Interfaces;

use App\DTO\ConfiguracoesDTO;

interface ConfiguracoesServiceInterface
{
    /**
     * Número do WhatsApp do suporte, só dígitos com DDD, ou null quando não configurado.
     */
    public function whatsappSuporte(): ?string;

    /**
     * Link wa.me do suporte com a mensagem pronta, ou null quando não configurado.
     */
    public function linkWhatsappSuporte(?string $mensagem = null): ?string;

    public function atualizar(ConfiguracoesDTO $dados): void;
}
