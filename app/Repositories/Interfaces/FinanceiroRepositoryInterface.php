<?php

namespace App\Repositories\Interfaces;

use App\DTO\FinanceiroParcelaDTO;
use App\DTO\FinanceiroSearchDTO;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface FinanceiroRepositoryInterface extends AbstractRepositoryInterface
{
    public function storeParcela(FinanceiroParcelaDTO $dto);

    public function indexParcelas(?FinanceiroSearchDTO $data = null): LengthAwarePaginator;

    /**
     * @return array{
     *     counts: array{todos: int, aberto: int, pago: int, parcial: int},
     *     total_credits: float|int,
     *     total_debits: float|int
     * }
     */
    public function resumoParcelas(?FinanceiroSearchDTO $data = null): array;
}
