<?php

namespace App\Repositories;

use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Repositories\Interfaces\FinanceiroParcelaRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class FinanceiroParcelaRepository extends AbstractRepository implements FinanceiroParcelaRepositoryInterface
{
    public function __construct(FinanceiroParcela $financeiroParcela)
    {
        parent::__construct($financeiroParcela);
    }

    public function findDoUsuarioComFinanceiro(int $id): FinanceiroParcela
    {
        return $this->model->newQuery()
            ->where('usuario_id', Auth::id())
            ->with('financeiro')
            ->findOrFail($id);
    }

    public function updateFormaPagamentoDoFinanceiro(int $financeiroId, int $formaPagamentoId): void
    {
        Financeiro::query()
            ->whereKey($financeiroId)
            ->update(['forma_pagamento_id' => $formaPagamentoId]);
    }
}
