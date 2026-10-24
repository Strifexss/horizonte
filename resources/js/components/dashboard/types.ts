import type { ExtratoResumo } from '@/components/extrato/types';
import type { AnaliseDashboard } from '@/components/insights/types';

export type SaldoMensal = {
    mes: number;
    rotulo: string;
    saldo: number;
};

export type PontoMensal = {
    mes: number;
    rotulo: string;
    valor: number;
};

export type SeriesMensais = {
    receitas: PontoMensal[];
    despesas: PontoMensal[];
    saldos: SaldoMensal[];
};

export type FatiaPizza = {
    rotulo: string;
    valor: number;
};

export type DespesaPorCategoria = {
    categoria: string;
    valor: number;
};

export type DespesaPorGrupoDeProduto = {
    grupo: string;
    valor: number;
};

export type SemanaReceitas = {
    inicio: string;
    fim: string;
    rotulo: string;
};

export type ReceitaPorDiaDaSemana = {
    dia: number;
    rotulo: string;
    valor: number;
};

export type CriterioRanking = 'produtos' | 'fornecedores' | 'categorias_despesa' | 'categorias_receita';

export type ItemRanking = {
    posicao: number;
    nome: string;
    valor: number;
    lancamentos: number;
    percentual: number;
};

export type Ranking = {
    criterio: CriterioRanking;
    total: number;
    itens: ItemRanking[];
};

export type DashboardPageProps = {
    ano: number;
    mes: number;
    anos: number[];
    semana: string;
    semanas: SemanaReceitas[];
    rankingCriterio: CriterioRanking;
    resumo?: ExtratoResumo;
    seriesMensais?: SeriesMensais;
    despesasPorCategoria?: DespesaPorCategoria[];
    despesasPorGrupoDeProduto?: DespesaPorGrupoDeProduto[];
    receitasPorDiaDaSemana?: ReceitaPorDiaDaSemana[];
    ranking?: Ranking;
    insights?: AnaliseDashboard | null;
};
