<?php

namespace App\Repositories\Interfaces;

use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * Persistência do Copiloto: conversas (tabelas do laravel/ai), perguntas sem resposta e interesses em módulos.
 */
interface CopilotoRepositoryInterface
{
    public function conversaPertenceAoUsuario(string $conversaId, User $user): bool;

    /**
     * Conversa mais recente do usuário, ou null.
     */
    public function conversaAtual(User $user): ?string;

    /**
     * @return list<array{papel: 'usuario'|'copiloto', texto: string}>
     */
    public function mensagens(string $conversaId): array;

    public function excluirConversasDoUsuario(User $user): void;

    /**
     * @return int conversas apagadas
     */
    public function excluirConversasSemAtividadeDesde(CarbonInterface $limite): int;

    public function registrarPerguntaSemResposta(?int $empresaId, string $pergunta, ?string $tela): void;

    public function registrarInteresse(?int $empresaId, int $userId, string $modulo): void;

    /**
     * @return Collection<int, object{id: int, pergunta: string, tela: ?string, empresa: ?string, created_at: string}>
     */
    public function perguntasSemResposta(int $limite): Collection;

    /**
     * @return Collection<int, object{id: int, modulo: string, empresa: ?string, usuario: ?string, created_at: string}>
     */
    public function interesses(int $limite): Collection;
}
