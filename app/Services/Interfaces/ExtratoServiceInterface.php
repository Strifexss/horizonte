<?php

namespace App\Services\Interfaces;

use App\DTO\FinanceiroDTO;

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
}
