<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use RuntimeException;

class LimiteDeAnalisesException extends RuntimeException implements ShouldntReport
{
    public function __construct(int $limite)
    {
        parent::__construct("Você já gerou {$limite} análises hoje. Tente novamente amanhã.");
    }
}
