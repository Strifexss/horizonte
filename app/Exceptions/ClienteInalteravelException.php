<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use RuntimeException;

/**
 * O cliente não pode ser alterado ou excluído: é o CONSUMIDOR do sistema ou já tem vendas.
 */
class ClienteInalteravelException extends RuntimeException implements ShouldntReport
{
    public static function consumidor(): self
    {
        return new self('O cliente CONSUMIDOR é padrão do sistema e não pode ser alterado nem excluído.');
    }

    public static function emUso(): self
    {
        return new self('Não é possível excluir este cliente porque ele tem vendas. Você pode inativá-lo.');
    }
}
