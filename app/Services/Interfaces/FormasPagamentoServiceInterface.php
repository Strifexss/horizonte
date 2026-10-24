<?php

namespace App\Services\Interfaces;

use App\Models\FormaPagamento;
use Illuminate\Support\Collection;

interface FormasPagamentoServiceInterface extends AbstractServiceInterface
{
    /**
     * @return Collection<int, FormaPagamento>
     */
    public function ativas(): Collection;
}
