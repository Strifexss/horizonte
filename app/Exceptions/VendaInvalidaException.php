<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use RuntimeException;

class VendaInvalidaException extends RuntimeException implements ShouldntReport
{
    public const CAMPO_CONTA = 'conta';

    public function __construct(
        public readonly string $campo,
        string $message
    ) {
        parent::__construct($message);
    }
}
