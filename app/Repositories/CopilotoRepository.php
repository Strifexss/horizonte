<?php

namespace App\Repositories;

use App\Models\CopilotoInteresse;
use App\Models\CopilotoPerguntaSemResposta;
use App\Models\User;
use App\Repositories\Interfaces\CopilotoRepositoryInterface;
use Carbon\CarbonInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CopilotoRepository implements CopilotoRepositoryInterface
{
    public function conversaPertenceAoUsuario(string $conversaId, User $user): bool
    {
        return $this->conversasDoUsuario($user)->where('id', $conversaId)->exists();
    }

    public function conversaAtual(User $user): ?string
    {
        $id = $this->conversasDoUsuario($user)->orderByDesc('updated_at')->value('id');

        return $id === null ? null : (string) $id;
    }

    public function mensagens(string $conversaId): array
    {
        return DB::table($this->tabelaMensagens())
            ->where('conversation_id', $conversaId)
            ->whereIn('role', ['user', 'assistant'])
            ->orderBy('created_at')
            ->orderBy('id')
            ->get(['role', 'content'])
            ->map(fn (object $mensagem): array => [
                'papel' => $mensagem->role === 'user' ? 'usuario' : 'copiloto',
                'texto' => $mensagem->role === 'user' ? (string) $mensagem->content : $this->textoDaResposta((string) $mensagem->content),
            ])
            ->values()
            ->all();
    }

    public function excluirConversasDoUsuario(User $user): void
    {
        $ids = $this->conversasDoUsuario($user)->pluck('id');

        $this->excluirConversas($ids);
    }

    public function excluirConversasSemAtividadeDesde(CarbonInterface $limite): int
    {
        $ids = DB::table($this->tabelaConversas())->where('updated_at', '<', $limite)->pluck('id');

        return $this->excluirConversas($ids);
    }

    public function registrarPerguntaSemResposta(?int $empresaId, string $pergunta, ?string $tela): void
    {
        CopilotoPerguntaSemResposta::query()->create([
            'empresa_id' => $empresaId,
            'pergunta' => $pergunta,
            'tela' => $tela,
        ]);
    }

    public function registrarInteresse(?int $empresaId, int $userId, string $modulo): void
    {
        CopilotoInteresse::query()->create([
            'empresa_id' => $empresaId,
            'user_id' => $userId,
            'modulo' => $modulo,
        ]);
    }

    public function perguntasSemResposta(int $limite): Collection
    {
        return DB::table('copiloto_pergunta_sem_resposta as p')
            ->leftJoin('empresas as e', 'e.id', '=', 'p.empresa_id')
            ->orderByDesc('p.created_at')
            ->orderByDesc('p.id')
            ->limit($limite)
            ->get(['p.id', 'p.pergunta', 'p.tela', 'e.nome as empresa', 'p.created_at']);
    }

    public function interesses(int $limite): Collection
    {
        return DB::table('copiloto_interesse as i')
            ->leftJoin('empresas as e', 'e.id', '=', 'i.empresa_id')
            ->leftJoin('users as u', 'u.id', '=', 'i.user_id')
            ->orderByDesc('i.created_at')
            ->orderByDesc('i.id')
            ->limit($limite)
            ->get(['i.id', 'i.modulo', 'e.nome as empresa', 'u.name as usuario', 'i.created_at']);
    }

    private function conversasDoUsuario(User $user): Builder
    {
        return DB::table($this->tabelaConversas())
            ->where('participant_type', $user->getMorphClass())
            ->where('participant_id', $user->getKey());
    }

    /**
     * @param  Collection<int, mixed>  $ids
     */
    private function excluirConversas(Collection $ids): int
    {
        if ($ids->isEmpty()) {
            return 0;
        }

        DB::table($this->tabelaMensagens())->whereIn('conversation_id', $ids)->delete();

        return DB::table($this->tabelaConversas())->whereIn('id', $ids)->delete();
    }

    /**
     * A resposta é gravada como o JSON da saída estruturada ({"resposta": ..., "respondeu": ...}).
     */
    private function textoDaResposta(string $conteudo): string
    {
        $json = json_decode($conteudo, true);

        return is_array($json) && is_string($json['resposta'] ?? null) ? $json['resposta'] : $conteudo;
    }

    private function tabelaConversas(): string
    {
        return (string) config('ai.conversations.tables.conversations', 'agent_conversations');
    }

    private function tabelaMensagens(): string
    {
        return (string) config('ai.conversations.tables.messages', 'agent_conversation_messages');
    }
}
