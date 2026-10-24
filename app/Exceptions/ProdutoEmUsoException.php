<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use RuntimeException;

class ProdutoEmUsoException extends RuntimeException implements ShouldntReport
{
    public function __construct()
    {
        parent::__construct('Não é possível excluir este produto porque ele já foi usado em lançamentos ou vendas. Você pode inativá-lo.');
    }
}
