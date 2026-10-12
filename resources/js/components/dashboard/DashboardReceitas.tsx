import { useMemo } from 'react';
import { barY, defineChart } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/charts/react';

import type { ReceitaPorDiaDaSemana, SemanaReceitas } from '@/components/dashboard/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DashboardReceitasProps = {
    ano: number;
    mes: string;
    semana: string;
    semanas: SemanaReceitas[];
    receitas: ReceitaPorDiaDaSemana[];
    onFiltroChange: (mes: string, semana: string | null) => void;
};

const COR_RECEITA = '#16a34a';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const NOMES_MES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];

function mesesDoAno(ano: number): { valor: string; rotulo: string }[] {
    return NOMES_MES.map((rotulo, indice) => ({
        valor: `${ano}-${String(indice + 1).padStart(2, '0')}`,
        rotulo,
    }));
}

function dominioReceita(receitas: readonly ReceitaPorDiaDaSemana[]): [number, number] {
    let maximo = 0;

    for (const ponto of receitas) {
        maximo = Math.max(maximo, ponto.valor);
    }

    if (maximo === 0) {
        return [0, 1];
    }

    return [0, maximo];
}

export default function DashboardReceitas({
    ano,
    mes,
    semana,
    semanas,
    receitas,
    onFiltroChange,
}: DashboardReceitasProps) {
    const dominio = useMemo(() => dominioReceita(receitas), [receitas]);
    const opcoesMes = useMemo(() => mesesDoAno(ano), [ano]);

    const chart = useMemo(
        () =>
            defineChart({
                marks: [
                    barY(receitas, {
                        x: 'rotulo',
                        y: 'valor',
                        fill: COR_RECEITA,
                    }),
                ],
                scales: {
                    x: { scale: () => scaleBand<string>().padding(0.2) },
                    y: {
                        scale: () => scaleLinear().domain(dominio).nice(),
                        grid: true,
                        axis: {
                            ticks: {
                                format: (valor) => moeda.format(valor),
                            },
                        },
                    },
                },
                tooltip,
            }),
        [dominio, receitas],
    );

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-3 shadow-sm dark:bg-slate-900">
            <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0">
                    <div className="text-sm font-medium">Receitas por dia da semana</div>
                    <div className="text-xs text-muted-foreground">Competência</div>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Select value={mes} onValueChange={(proximoMes) => onFiltroChange(proximoMes, null)}>
                        <SelectTrigger className="h-8 w-[8.5rem] text-xs" aria-label="Mês das receitas">
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                            {opcoesMes.map((opcao) => (
                                <SelectItem key={opcao.valor} value={opcao.valor}>
                                    {opcao.rotulo}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={semana} onValueChange={(proximaSemana) => onFiltroChange(mes, proximaSemana)}>
                        <SelectTrigger className="h-8 w-[9.5rem] text-xs" aria-label="Semana das receitas">
                            <SelectValue placeholder="Semana" />
                        </SelectTrigger>
                        <SelectContent>
                            {semanas.map((opcao) => (
                                <SelectItem key={opcao.inicio} value={opcao.inicio}>
                                    {opcao.rotulo}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="h-[280px] w-full min-w-0 shrink-0">
                <Chart definition={chart} height={280} ariaLabel="Receitas por dia da semana" />
            </div>
        </div>
    );
}
