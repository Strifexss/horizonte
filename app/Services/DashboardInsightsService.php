<?php

namespace App\Services;

use App\Ai\Agents\AnalistaDashboard;
use App\Exceptions\LimiteDeAnalisesException;
use App\Jobs\GerarAnaliseDashboard;
use App\Models\DashboardAnalise;
use App\Models\InsightAcao;
use App\Repositories\Interfaces\DashboardAnaliseRepositoryInterface;
use App\Repositories\Interfaces\InsightAcaoRepositoryInterface;
use App\Services\Interfaces\DashboardInsightsServiceInterface;
use App\Services\Interfaces\IndicadoresInsightsServiceInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Ai\Exceptions\FailoverableException;
use Laravel\Ai\Exceptions\InsufficientCreditsException;
use Laravel\Ai\Exceptions\RateLimitedException;
use Throwable;

class DashboardInsightsService extends ServiceAbstract implements DashboardInsightsServiceInterface
{
    /**
     * Diferença aceita entre um número citado pela IA e o número do pacote.
     */
    private const TOLERANCIA_ABSOLUTA = 0.01;

    private const TOLERANCIA_RELATIVA = 0.005;

    private const MINUTOS_PARA_TRAVAR = 10;

    public function __construct(
        private DashboardAnaliseRepositoryInterface $dashboardAnaliseRepository,
        private InsightAcaoRepositoryInterface $insightAcaoRepository,
        private IndicadoresInsightsServiceInterface $indicadoresInsightsService,
    ) {
        parent::__construct($dashboardAnaliseRepository);
    }

    public function analiseDoPeriodo(int $usuarioId, int $ano, int $mes): ?DashboardAnalise
    {
        $analise = $this->dashboardAnaliseRepository->ultimaDoPeriodo($usuarioId, $ano, $mes);

        if ($analise && $this->travada($analise)) {
            $analise = $this->dashboardAnaliseRepository->update($analise->id, [
                'status' => DashboardAnalise::STATUS_FALHOU,
                'erro' => 'A análise demorou demais. Tente de novo.',
            ])->load('acoes');
        }

        return $analise;
    }

    public function gerar(int $usuarioId, int $ano, int $mes, bool $forcar = false): DashboardAnalise
    {
        $ultima = $this->analiseDoPeriodo($usuarioId, $ano, $mes);

        if ($ultima && $ultima->status === DashboardAnalise::STATUS_PROCESSANDO) {
            return $ultima;
        }

        $pacote = $this->indicadoresInsightsService->montar($usuarioId, $ano, $mes);
        $hash = hash('sha256', (string) json_encode($pacote));

        if (! $forcar && $ultima && $ultima->status === DashboardAnalise::STATUS_CONCLUIDA && $ultima->hash_dados === $hash) {
            return $ultima;
        }

        $limite = (int) config('insights.limite_analises');
        $janelaEmMinutos = (int) config('insights.janela_limite_minutos');

        if ($this->dashboardAnaliseRepository->contarGeradasDesde($usuarioId, now()->subMinutes($janelaEmMinutos)) >= $limite) {
            throw new LimiteDeAnalisesException($limite, $janelaEmMinutos);
        }

        $analise = $this->dashboardAnaliseRepository->store([
            'usuario_id' => $usuarioId,
            'ano' => $ano,
            'mes' => $mes,
            'status' => DashboardAnalise::STATUS_PROCESSANDO,
            'hash_dados' => $hash,
            'pacote' => $pacote,
        ]);

        GerarAnaliseDashboard::dispatch($analise->id);

        return $analise;
    }

    public function processar(int $analiseId): void
    {
        $analise = $this->dashboardAnaliseRepository->find($analiseId);

        if ($analise->status !== DashboardAnalise::STATUS_PROCESSANDO) {
            return;
        }

        try {
            $resposta = $this->perguntarAIa($analise->pacote ?? []);
        } catch (RateLimitedException|InsufficientCreditsException $erro) {
            Log::error('Análise do dashboard interrompida: cota ou créditos do provedor de IA esgotados. '.$erro::class.': '.$erro->getMessage(), [
                'analise_id' => $analise->id,
                'detalhe' => $erro->getPrevious() instanceof RequestException
                    ? $erro->getPrevious()->response->body()
                    : $erro->getPrevious()?->getMessage(),
            ]);
            $this->registrarFalha($analise->id, 'Não foi possível gerar a análise agora. Tente novamente mais tarde.');

            return;
        } catch (FailoverableException $erro) {
            throw $erro;
        } catch (Throwable $erro) {
            report($erro);
            $this->registrarFalha($analise->id, 'Não foi possível gerar a análise agora. Tente de novo.');

            return;
        }

        [$insights, $descartados] = $this->validarInsights($resposta['insights'] ?? [], $analise->pacote ?? []);

        $this->dashboardAnaliseRepository->update($analise->id, [
            'status' => DashboardAnalise::STATUS_CONCLUIDA,
            'resumo' => (string) ($resposta['resumo'] ?? ''),
            'insights' => $insights,
            'resultados_acoes' => array_values($resposta['resultados_acoes'] ?? []),
            'insights_descartados' => $descartados,
            'modelo' => config('ai.default').':'.config('ai.providers.'.config('ai.default').'.models.text.default'),
        ]);
    }

    public function registrarAcao(int $analiseId, int $usuarioId, string $chave, string $acao, ?string $motivo = null): InsightAcao
    {
        $analise = $this->dashboardAnaliseRepository->findForUsuario($analiseId, $usuarioId);
        $insight = collect($analise->insights)->firstWhere('chave', $chave);

        if (! $insight) {
            throw (new ModelNotFoundException)->setModel(InsightAcao::class);
        }

        return $this->insightAcaoRepository->registrar([
            'usuario_id' => $usuarioId,
            'dashboard_analise_id' => $analise->id,
            'chave' => $chave,
            'tipo' => (string) $insight['tipo'],
            'titulo' => (string) $insight['titulo'],
            'acao' => $acao,
            'motivo' => $acao === InsightAcao::ACAO_DISPENSADO ? $motivo : null,
            'ano' => $analise->ano,
            'mes' => $analise->mes,
        ]);
    }

    public function desfazerAcao(int $analiseId, int $usuarioId, string $chave): void
    {
        $analise = $this->dashboardAnaliseRepository->findForUsuario($analiseId, $usuarioId);

        $this->insightAcaoRepository->remover($analise->id, $chave);
    }

    public function registrarFalha(int $analiseId, string $mensagem): void
    {
        $analise = $this->dashboardAnaliseRepository->find($analiseId);

        if ($analise->status !== DashboardAnalise::STATUS_PROCESSANDO) {
            return;
        }

        $this->dashboardAnaliseRepository->update($analiseId, [
            'status' => DashboardAnalise::STATUS_FALHOU,
            'erro' => $mensagem,
        ]);
    }

    /**
     * Análise que ficou em andamento além do tempo máximo do job (o worker caiu, por exemplo).
     */
    private function travada(DashboardAnalise $analise): bool
    {
        return $analise->status === DashboardAnalise::STATUS_PROCESSANDO
            && $analise->created_at !== null
            && $analise->created_at->lt(now()->subMinutes(self::MINUTOS_PARA_TRAVAR));
    }

    /**
     * Uma única chamada à IA. Sobrecarga e falha de conexão sobem como FailoverableException
     * para o job tentar de novo depois. O 429 não volta para a fila: o limitador global já
     * respeita o limite por minuto, então um 429 do provedor indica cota esgotada.
     *
     * @param  array<string, mixed>  $pacote
     * @return array<string, mixed>
     */
    private function perguntarAIa(array $pacote): array
    {
        return AnalistaDashboard::make()->prompt(
            "Analise o pacote de indicadores abaixo e responda no formato pedido.\n\n".json_encode($pacote, JSON_UNESCAPED_UNICODE),
        )->toArray();
    }

    /**
     * Mantém só os insights com tipo e prioridade válidos e cujos números citados existem no pacote.
     *
     * @param  array<int, mixed>  $insights
     * @param  array<string, mixed>  $pacote
     * @return array{0: list<array<string, mixed>>, 1: int}
     */
    private function validarInsights(array $insights, array $pacote): array
    {
        $numerosDoPacote = $this->numerosDoPacote($pacote);
        $validos = [];

        foreach ($insights as $insight) {
            if (! is_array($insight)
                || ! in_array($insight['tipo'] ?? null, DashboardAnalise::TIPOS, true)
                || ! in_array($insight['prioridade'] ?? null, DashboardAnalise::PRIORIDADES, true)
                || trim((string) ($insight['titulo'] ?? '')) === ''
                || ! $this->numerosExistem($insight['numeros_usados'] ?? [], $numerosDoPacote)) {
                continue;
            }

            $validos[] = [
                'chave' => (string) Str::ulid(),
                'tipo' => $insight['tipo'],
                'prioridade' => $insight['prioridade'],
                'titulo' => (string) $insight['titulo'],
                'explicacao' => (string) ($insight['explicacao'] ?? ''),
                'impacto_rotulo' => (string) ($insight['impacto_rotulo'] ?? ''),
                'impacto_valor' => round((float) ($insight['impacto_valor'] ?? 0), 2),
                'acao' => (string) ($insight['acao'] ?? ''),
                'base' => (string) ($insight['base'] ?? ''),
            ];
        }

        return [$validos, count($insights) - count($validos)];
    }

    /**
     * @param  array<string, mixed>  $pacote
     * @return list<float>
     */
    private function numerosDoPacote(array $pacote): array
    {
        $numeros = [];

        array_walk_recursive($pacote, function ($valor) use (&$numeros): void {
            if (is_int($valor) || is_float($valor)) {
                $numeros[] = (float) $valor;
            }
        });

        return $numeros;
    }

    /**
     * @param  mixed  $citados
     * @param  list<float>  $numerosDoPacote
     */
    private function numerosExistem($citados, array $numerosDoPacote): bool
    {
        if (! is_array($citados)) {
            return false;
        }

        foreach ($citados as $citado) {
            if (! is_numeric($citado)) {
                return false;
            }

            $valor = (float) $citado;
            $encontrado = false;

            foreach ($numerosDoPacote as $numero) {
                $diferenca = abs($numero - $valor);

                if ($diferenca <= self::TOLERANCIA_ABSOLUTA || $diferenca <= abs($numero) * self::TOLERANCIA_RELATIVA) {
                    $encontrado = true;
                    break;
                }
            }

            if (! $encontrado) {
                return false;
            }
        }

        return true;
    }
}
