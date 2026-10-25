<?php

namespace App\Jobs;

use App\Services\Interfaces\DashboardInsightsServiceInterface;
use DateTimeInterface;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\Client\RequestException;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Exceptions\FailoverableException;
use Throwable;

/**
 * Chama a IA fora da requisição: no plano gratuito do Gemini a resposta leva perto de um minuto.
 * Cada execução faz uma única chamada e respeita o limite global de requisições por minuto.
 */
class GerarAnaliseDashboard implements ShouldQueue
{
    use Queueable;

    public const LIMITADOR = 'insights-ia';

    public int $timeout = 180;

    public function __construct(public int $analiseId) {}

    /**
     * @return list<object>
     */
    public function middleware(): array
    {
        return [new RateLimited(self::LIMITADOR)];
    }

    public function retryUntil(): DateTimeInterface
    {
        return now()->addMinutes((int) config('insights.minutos_na_fila'));
    }

    public function handle(DashboardInsightsServiceInterface $dashboardInsightsService): void
    {
        try {
            $dashboardInsightsService->processar($this->analiseId);
        } catch (FailoverableException $erro) {
            Log::warning('Análise do dashboard devolvida à fila: '.$erro::class.': '.$erro->getMessage(), [
                'analise_id' => $this->analiseId,
                'tentativa' => $this->attempts(),
                'detalhe' => $erro->getPrevious() instanceof RequestException
                    ? $erro->getPrevious()->response->body()
                    : $erro->getPrevious()?->getMessage(),
            ]);

            $this->release((int) config('insights.pausa_apos_sobrecarga_segundos'));
        }
    }

    public function failed(?Throwable $erro): void
    {
        app(DashboardInsightsServiceInterface::class)->registrarFalha(
            $this->analiseId,
            'O serviço de IA está ocupado agora. Tente de novo em alguns minutos.',
        );
    }
}
