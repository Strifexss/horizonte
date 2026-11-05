<?php

namespace App\Ai\Contracts;

/**
 * Limite global de chamadas à chave de IA, somando o Copiloto e os insights do Dashboard.
 */
interface LimitadorIaInterface
{
    /**
     * Reserva uma chamada. false quando o limite do minuto já foi atingido.
     */
    public function reservar(): bool;
}
