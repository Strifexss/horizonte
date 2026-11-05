<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use RuntimeException;

class CopilotoOcupadoException extends RuntimeException implements ShouldntReport
{
    public function __construct()
    {
        parent::__construct('O Copiloto está atendendo muita gente agora. Tente de novo em instantes.');
    }
}
