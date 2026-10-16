<?php

namespace App\Services\Interfaces;

use App\DTO\DashboardSearchDTO;
use App\DTO\FinanceiroSearchDTO;

interface DashboardServiceInterface extends AbstractServiceInterface
{
    /**
     * Anos que o seletor do Período de referência oferece (janela fixa em torno do ano atual).
     *
     * @return list<int>
     */
    public function anosDisponiveis(): array;

    /**
     * Completa o Período de referência: ano e mês atuais quando ausentes, e a Semana da receita
     * padrão do mês (a semana atual no mês corrente; senão, a primeira semana que cruza o mês).
     */
    public function resolverFiltros(DashboardSearchDTO $filtros): DashboardSearchDTO;

    /**
     * Filtro do Extrato para o mês do Período de referência, usado pelos KPIs do Dashboard.
     */
    public function filtrosDoResumoNoMes(DashboardSearchDTO $filtros): FinanceiroSearchDTO;

    /**
     * Receitas, despesas e saldo (receita − despesa) de cada mês do ano,
     * pela data de competência, sem filtrar status nem conta.
     *
     * @return array{
     *     receitas: list<array{mes: int, rotulo: string, valor: float}>,
     *     despesas: list<array{mes: int, rotulo: string, valor: float}>,
     *     saldos: list<array{mes: int, rotulo: string, saldo: float}>
     * }
     */
    public function seriesMensaisDoAno(int $ano): array;

    /**
     * Despesas por categoria no mês do Período de referência (competência).
     * Somamos o valor de face (financeiro_parcela.valor) de todas as parcelas de DESPESA
     * do usuário autenticado, sem filtros de status ou conta.
     *
     * @return list<array{categoria: string, valor: float}>
     */
    public function despesasPorCategoriaNoPeriodo(DashboardSearchDTO $filtros): array;

    /**
     * Despesas com produto no mês do Período de referência, agrupadas pelo grupo atual do produto.
     * Produto sem grupo entra na fatia "Sem grupo". Parcelas sem produto ficam de fora.
     *
     * @return list<array{grupo: string, valor: float}>
     */
    public function despesasPorGrupoDeProdutoNoPeriodo(DashboardSearchDTO $filtros): array;

    /**
     * Top 5 do ranking no mês do Período de referência (competência) para o critério escolhido, com o
     * percentual de participação de cada item sobre o total de todos os itens do critério.
     *
     * @return array{
     *     criterio: string,
     *     total: float,
     *     itens: list<array{posicao: int, nome: string, valor: float, lancamentos: int, percentual: float}>
     * }
     */
    public function rankingNoPeriodo(DashboardSearchDTO $filtros): array;

    /**
     * Semanas (segunda a domingo) que cruzam o mês do Período de referência, sem cortar a semana.
     *
     * @return list<array{inicio: string, fim: string, rotulo: string}>
     */
    public function semanasQueCruzamOMes(DashboardSearchDTO $filtros): array;

    /**
     * Receitas de face por dia da semana (Seg–Dom) na Semana da receita (que começa na segunda informada).
     *
     * @return list<array{dia: int, rotulo: string, valor: float}>
     */
    public function receitasPorDiaDaSemana(DashboardSearchDTO $filtros): array;
}
