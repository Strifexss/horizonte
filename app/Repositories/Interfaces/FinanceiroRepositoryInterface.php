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
     * Soma o valor de face das parcelas de RECEITA do usuário autenticado em cada mês de competência.
     * Abertas, parciais e pagas entram. Não filtra conta.
     *
     * @return Collection<int, object{mes: int|string, valor: float|int|string}>
     */
    public function receitasMensaisPorCompetencia(int $ano): Collection;

    /**
     * Soma o valor de face das parcelas de DESPESA do usuário autenticado em cada mês de competência.
     * Abertas, parciais e pagas entram. Não filtra conta.
     *
     * @return Collection<int, object{mes: int|string, valor: float|int|string}>
     */
    public function despesasMensaisPorCompetencia(int $ano): Collection;

    /**
     * Soma o valor de face das parcelas de DESPESA do usuário autenticado
     * em cada categoria, considerando o intervalo do período (data de competência).
     *
     * @return Collection<int, object{categoria: string|null, valor: float|int}>
     */
    public function despesasPorCategoriaNoPeriodo(string $dataInicio, string $dataFim): Collection;

    /**
     * Soma o valor de face das parcelas de DESPESA com produto do usuário autenticado
     * em cada grupo atual do produto, pela competência. Sem grupo vira "Sem grupo".
     *
     * @return Collection<int, object{grupo: string|null, valor: float|int}>
     */
    public function despesasPorGrupoDeProdutoNoPeriodo(string $dataInicio, string $dataFim): Collection;

    /**
     * Soma o valor de face das parcelas de RECEITA do usuário autenticado
     * em cada dia da semana ISO (1 = segunda … 7 = domingo), pela competência.
     *
     * @return Collection<int, object{dia: int|string, valor: float|int|string}>
     */
    public function receitasPorDiaDaSemanaNoPeriodo(string $dataInicio, string $dataFim): Collection;
}
