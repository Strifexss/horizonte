<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use RuntimeException;

class FormaPagamentoEmUsoException extends RuntimeException implements ShouldntReport
{
    public function __construct()
    {
        parent::__construct('Não é possível excluir esta forma de pagamento porque ela já foi usada. Você pode desativá-la.');
    }
}
