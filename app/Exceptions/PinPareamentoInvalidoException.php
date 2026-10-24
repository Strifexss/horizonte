<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use RuntimeException;

class PinPareamentoInvalidoException extends RuntimeException implements ShouldntReport
{
    public function __construct()
    {
        parent::__construct('PIN não encontrado ou expirado. Gere um novo PIN no ERP.');
    }
}
