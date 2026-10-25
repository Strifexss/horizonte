<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use RuntimeException;

class LimiteDeAnalisesException extends RuntimeException implements ShouldntReport
{
    public function __construct(int $limite, int $janelaEmMinutos)
    {
        parent::__construct("Você já gerou {$limite} análises nos últimos {$janelaEmMinutos} minutos. Aguarde alguns minutos e tente de novo.");
    }
}
