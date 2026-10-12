export type SaldoMensal = {
    mes: number;
    rotulo: string;
    saldo: number;
};

export type DespesaPorCategoria = {
    categoria: string;
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
    mesReceitas: string;
    semanaReceitas: string;
    semanasReceitas: SemanaReceitas[];
    receitasPorDiaDaSemana?: ReceitaPorDiaDaSemana[];
};
