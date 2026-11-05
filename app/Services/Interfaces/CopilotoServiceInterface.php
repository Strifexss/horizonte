<?php

namespace App\Services\Interfaces;

use App\DTO\CopilotoMensagemDTO;
use App\Models\User;
use Illuminate\Support\Collection;

interface CopilotoServiceInterface
{
    /**
     * Dados para abrir o chat: conversa atual, sugestões da tela e a oferta de um módulo que a Empresa não tem.
     *
     * @return array{
     *     conversa_id: ?string,
     *     mensagens: list<array{papel: 'usuario'|'copiloto', texto: string}>,
     *     sugestoes: list<string>,
     *     oferta: array{modulo: string, titulo: string, oferta: string, texto: string}|null,
     *     suporte_url: ?string
     * }
     */
    public function abertura(User $user, ?string $componente): array;

    /**
     * @return array{conversa_id: string, resposta: string, respondeu: bool, suporte_url: ?string}
     */
    public function perguntar(CopilotoMensagemDTO $dados, User $user): array;

    public function novaConversa(User $user): void;

    /**
     * Registra o interesse e devolve o link do WhatsApp com a mensagem pronta.
     *
     * @return array{whatsapp_url: ?string}
     */
    public function registrarInteresse(User $user, string $modulo): array;

    /**
     * @return int conversas apagadas
     */
    public function apagarConversasSemAtividade(): int;

    /**
     * @return Collection<int, object>
     */
    public function perguntasSemResposta(): Collection;

    /**
     * @return Collection<int, object>
     */
    public function interesses(): Collection;
}
