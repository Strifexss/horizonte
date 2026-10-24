<?php

namespace App\Services\Interfaces;

use App\Exceptions\LimiteDeAnalisesException;
use App\Models\DashboardAnalise;
use App\Models\InsightAcao;
use Laravel\Ai\Exceptions\FailoverableException;

interface DashboardInsightsServiceInterface extends AbstractServiceInterface
{
    public function analiseDoPeriodo(int $usuarioId, int $ano, int $mes): ?DashboardAnalise;

    /**
     * Pede a análise do período e a coloca na fila. Devolve a análise em andamento ou,
     * sem mudança nos dados e sem $forcar, a última concluída.
     *
     * @throws LimiteDeAnalisesException
     */
    public function gerar(int $usuarioId, int $ano, int $mes, bool $forcar = false): DashboardAnalise;

    /**
     * Executa a análise na fila com uma única chamada à IA, valida os insights e grava o resultado.
     *
     * @throws FailoverableException quando o provedor está sobrecarregado ou limitando; o job tenta de novo depois
     */
    public function processar(int $analiseId): void;

    public function registrarFalha(int $analiseId, string $mensagem): void;

    public function registrarAcao(int $analiseId, int $usuarioId, string $chave, string $acao, ?string $motivo = null): InsightAcao;

    public function desfazerAcao(int $analiseId, int $usuarioId, string $chave): void;
}
