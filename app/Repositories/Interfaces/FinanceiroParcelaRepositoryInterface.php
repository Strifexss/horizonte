<?php

namespace App\Repositories\Interfaces;

use App\Models\FinanceiroParcela;

interface FinanceiroParcelaRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Parcela do usuário autenticado com o financeiro carregado.
     */
    public function findDaEmpresaComFinanceiro(int $id): FinanceiroParcela;

    public function updateFormaPagamentoDoFinanceiro(int $financeiroId, int $formaPagamentoId): void;
}
