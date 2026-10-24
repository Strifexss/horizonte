<?php

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use RuntimeException;

class LancamentoDeVendaException extends RuntimeException implements ShouldntReport
{
    public function __construct()
    {
        parent::__construct('Este lançamento foi gerado por uma venda: aqui só é possível dar baixa. Para mudar valor, forma de pagamento ou excluir, cancele a venda.');
    }
}
