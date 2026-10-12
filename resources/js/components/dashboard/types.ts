export type SaldoMensal = {
    mes: number;
    rotulo: string;
    saldo: number;
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

export type DashboardPageProps = {
    ano: number;
    saldos?: SaldoMensal[];
    dataInicioDespesasPorCategoria: string;
    dataFimDespesasPorCategoria: string;
    despesasPorCategoria?: DespesaPorCategoria[];
    dataInicioDespesasPorGrupo: string;
    dataFimDespesasPorGrupo: string;
    despesasPorGrupoDeProduto?: DespesaPorGrupoDeProduto[];
    mesReceitas: string;
    semanaReceitas: string;
    semanasReceitas: SemanaReceitas[];
    receitasPorDiaDaSemana?: ReceitaPorDiaDaSemana[];
};
