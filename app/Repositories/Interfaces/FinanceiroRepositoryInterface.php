<?php

namespace App\Repositories\Interfaces;

use App\DTO\FinanceiroParcelaDTO;
use App\DTO\FinanceiroSearchDTO;
use App\Models\FinanceiroParcela;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

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

    /**
     * Retorna todas as parcelas para exportação (sem paginação).
     *
     * @return Collection<int, FinanceiroParcela>
     */
    public function exportParcelas(?FinanceiroSearchDTO $data = null): Collection;

    /**
     * Soma o valor de face das parcelas do usuário autenticado em cada mês de competência.
     * Abertas, parciais e pagas entram. Não filtra conta.
     *
     * @return Collection<int, object{mes: int|string, receitas: float|int|string, despesas: float|int|string}>
     */
    public function somasMensaisPorCompetencia(int $ano): Collection;
}
