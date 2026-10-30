<?php

namespace App\Repositories;

use App\Models\Empresa;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Repositories\Interfaces\FinanceiroParcelaRepositoryInterface;

class FinanceiroParcelaRepository extends AbstractRepository implements FinanceiroParcelaRepositoryInterface
{
    public function __construct(FinanceiroParcela $financeiroParcela)
    {
        parent::__construct($financeiroParcela);
    }

    public function findDaEmpresaComFinanceiro(int $id): FinanceiroParcela
    {
        return $this->model->newQuery()
            ->where('empresa_id', Empresa::atualId())
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
