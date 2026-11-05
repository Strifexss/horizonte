<?php

namespace App\Services;

use App\Ai\Contracts\CopilotoAgenteInterface;
use App\Ai\Contracts\LimitadorIaInterface;
use App\Ai\Copiloto\TelaAjuda;
use App\DTO\CopilotoContextoDTO;
use App\DTO\CopilotoMensagemDTO;
use App\Exceptions\CopilotoOcupadoException;
use App\Models\User;
use App\Modulos;
use App\Repositories\Interfaces\AjudaRepositoryInterface;
use App\Repositories\Interfaces\CopilotoRepositoryInterface;
use App\Services\Interfaces\ConfiguracoesServiceInterface;
use App\Services\Interfaces\CopilotoServiceInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CopilotoService implements CopilotoServiceInterface
{
    private const MAXIMO_SUGESTOES = 3;

    private const LIMITE_RELATORIO = 200;

    public function __construct(
        private CopilotoAgenteInterface $agente,
        private AjudaRepositoryInterface $ajudaRepository,
        private CopilotoRepositoryInterface $copilotoRepository,
        private ConfiguracoesServiceInterface $configuracoesService,
        private LimitadorIaInterface $limitadorIa,
    ) {}

    public function abertura(User $user, ?string $componente): array
    {
        $modulos = $this->modulosDaEmpresa($user);
        $conversaId = $this->copilotoRepository->conversaAtual($user);
        $oferta = $this->ajudaRepository->ofertas($this->modulosAusentes($modulos))[0] ?? null;
        $vagas = $oferta === null ? self::MAXIMO_SUGESTOES : self::MAXIMO_SUGESTOES - 1;

        return [
            'conversa_id' => $conversaId,
            'mensagens' => $conversaId === null ? [] : $this->copilotoRepository->mensagens($conversaId),
            'sugestoes' => array_slice($this->ajudaRepository->sugestoes(TelaAjuda::doComponente($componente), $modulos), 0, $vagas),
            'oferta' => $oferta,
            'suporte_url' => $this->configuracoesService->linkWhatsappSuporte(),
        ];
    }

    public function perguntar(CopilotoMensagemDTO $dados, User $user): array
    {
        if ($dados->conversa_id !== null && ! $this->copilotoRepository->conversaPertenceAoUsuario($dados->conversa_id, $user)) {
            throw new ModelNotFoundException;
        }

        if (! $this->limitadorIa->reservar()) {
            throw new CopilotoOcupadoException;
        }

        $modulos = $this->modulosDaEmpresa($user);
        $tela = TelaAjuda::doComponente($dados->componente);

        $contexto = new CopilotoContextoDTO(
            ajuda: $this->ajudaRepository->paraPergunta($dados->mensagem, $modulos),
            ofertas: array_map(fn (array $oferta): string => $oferta['texto'], $this->ajudaRepository->ofertas($this->modulosAusentes($modulos))),
            telaAtual: $tela?->value,
        );

        $resposta = $this->agente->responder($dados->mensagem, $dados->conversa_id, $contexto, $user);

        if (! $resposta->respondeu) {
            $this->copilotoRepository->registrarPerguntaSemResposta($user->empresa()?->id, $dados->mensagem, $tela?->value);
        }

        return [
            'conversa_id' => $resposta->conversaId,
            'resposta' => $resposta->resposta,
            'respondeu' => $resposta->respondeu,
            'suporte_url' => $this->configuracoesService->linkWhatsappSuporte(),
        ];
    }

    public function novaConversa(User $user): void
    {
        DB::transaction(fn () => $this->copilotoRepository->excluirConversasDoUsuario($user));
    }

    public function registrarInteresse(User $user, string $modulo): array
    {
        $empresa = $user->empresa();
        $nomeModulo = Modulos::OPCIONAIS[$modulo]['nome'] ?? $modulo;

        $this->copilotoRepository->registrarInteresse($empresa?->id, (int) $user->id, $modulo);

        return [
            'whatsapp_url' => $this->configuracoesService->linkWhatsappSuporte(
                "Olá! Sou da empresa {$empresa?->nome} e quero conhecer o {$nomeModulo}."
            ),
        ];
    }

    public function apagarConversasSemAtividade(): int
    {
        $limite = now()->subDays(max(1, (int) config('copiloto.dias_para_apagar_conversa')));

        return DB::transaction(fn (): int => $this->copilotoRepository->excluirConversasSemAtividadeDesde($limite));
    }

    public function perguntasSemResposta(): Collection
    {
        return $this->copilotoRepository->perguntasSemResposta(self::LIMITE_RELATORIO);
    }

    public function interesses(): Collection
    {
        return $this->copilotoRepository->interesses(self::LIMITE_RELATORIO);
    }

    /**
     * @return list<string>
     */
    private function modulosDaEmpresa(User $user): array
    {
        return $user->empresa()?->modulosDisponiveis() ?? [];
    }

    /**
     * @param  list<string>  $modulos
     * @return list<string>
     */
    private function modulosAusentes(array $modulos): array
    {
        return array_values(array_diff(array_keys(Modulos::OPCIONAIS), $modulos));
    }
}
