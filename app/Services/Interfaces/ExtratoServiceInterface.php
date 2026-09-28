<?php

namespace App\Services\Interfaces;

use App\DTO\FinanceiroDTO;
use App\Models\FinanceiroParcela;
use Illuminate\Support\Collection;

interface ExtratoServiceInterface extends AbstractServiceInterface
{
    public function index($data = null);

    /**
     * @return array{
     *     counts: array{todos: int, aberto: int, pago: int, parcial: int},
     *     total_credits: float|int,
     *     total_debits: float|int
     * }
     */
    public function resumo($data = null): array;

    public function show(int $id);

    public function storeParcelas(FinanceiroDTO $financeiroDto);

    /**
     * Retorna todas as parcelas para exportação (sem paginação).
     *
     * @return Collection<int, FinanceiroParcela>
     */
    public function export($data = null);
}
