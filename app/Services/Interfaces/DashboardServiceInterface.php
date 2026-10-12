<?php

namespace App\Services\Interfaces;

use App\DTO\DashboardSearchDTO;

interface DashboardServiceInterface extends AbstractServiceInterface
{
    public function anoVigente(): int;

    public function resolverFiltros(DashboardSearchDTO $filtros): DashboardSearchDTO;

    /**
     * Saldo de cada mês do ano: valor das receitas menos valor das despesas,
     * pela data de competência, sem filtrar status nem conta.
     *
     * @return list<array{mes: int, rotulo: string, saldo: float}>
     */
    public function saldosDoAno(int $ano): array;

    /**
     * Despesas por categoria dentro do intervalo definido por data de competência.
     * Somamos o valor de face (financeiro_parcela.valor) de todas as parcelas de DESPESA
     * do usuário autenticado, sem filtros de status ou conta.
     *
     * @return list<array{categoria: string, valor: float}>
     */
    public function despesasPorCategoriaNoPeriodo(DashboardSearchDTO $filtros): array;

    /**
     * Semanas (segunda a domingo) que cruzam o mês YYYY-MM, sem cortar a semana.
     *
     * @return list<array{inicio: string, fim: string, rotulo: string}>
     */
    public function semanasQueCruzamOMes(DashboardSearchDTO $filtros): array;

    /**
     * Receitas de face por dia da semana (Seg–Dom) na semana que começa na segunda informada.
     *
     * @return list<array{dia: int, rotulo: string, valor: float}>
     */
    public function receitasPorDiaDaSemana(DashboardSearchDTO $filtros): array;
}
