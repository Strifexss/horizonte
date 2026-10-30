<?php

namespace App\Services\Interfaces;

interface IndicadoresInsightsServiceInterface extends AbstractServiceInterface
{
    /**
     * Pacote de indicadores do período, com números já calculados e relacionados.
     *
     * @return array<string, mixed>
     */
    public function montar(int $empresaId, int $ano, int $mes): array;
}
