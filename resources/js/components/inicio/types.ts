import type { ExtratoParcela } from '@/components/extrato/types';

export type ChavePrimeiroPasso = 'produto' | 'despesa' | 'venda' | 'tv';

export type PrimeiroPasso = {
    chave: ChavePrimeiroPasso;
    feito: boolean;
};

export type TotaisDoPeriodo = {
    receitas: number;
    despesas: number;
    saldo: number;
};

export type PeriodoResumo = 'hoje' | 'mes';

export type ResumoInicio = Record<PeriodoResumo, TotaisDoPeriodo>;

export type InicioPageProps = {
    primeirosPassos: PrimeiroPasso[];
    resumo?: ResumoInicio;
    ultimosLancamentos?: ExtratoParcela[];
};
