import { useEffect, useMemo, useState } from 'react';
import { barY, defineChart } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/charts/react';
import type { SaldoMensal } from '@/components/dashboard/types';

type DashboardGraficoProps = {
    ano: number;
    saldos: SaldoMensal[];
};

const COR_POSITIVO = '#16a34a';
const COR_NEGATIVO = '#dc2626';
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const moedaCompacta = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
});

function dominioSaldo(saldos: readonly SaldoMensal[]): [number, number] {
    let minimo = 0;
    let maximo = 0;

    for (const ponto of saldos) {
        minimo = Math.min(minimo, ponto.saldo);
        maximo = Math.max(maximo, ponto.saldo);
    }

    if (minimo === maximo) {
        return [minimo, maximo + 1];
    }

    return [minimo, maximo];
}

function useEixoCompacto(): boolean {
    const [compacto, setCompacto] = useState(false);

    useEffect(() => {
        const consulta = window.matchMedia('(max-width: 639px)');
        const atualizar = (): void => {
            setCompacto(consulta.matches);
        };

        atualizar();
        consulta.addEventListener('change', atualizar);

        return () => consulta.removeEventListener('change', atualizar);
    }, []);

    return compacto;
}

export default function DashboardGrafico({ ano, saldos }: DashboardGraficoProps) {
    const dominio = useMemo(() => dominioSaldo(saldos), [saldos]);
    const compacto = useEixoCompacto();

    const chart = useMemo(
        () =>
            defineChart({
                marks: [
                    barY(saldos, {
                        x: 'rotulo',
                        y: 'saldo',
                        fill: (ponto) => (ponto.saldo < 0 ? COR_NEGATIVO : COR_POSITIVO),
                    }),
                ],
                scales: {
                    x: {
                        scale: () => scaleBand<string>().padding(0.2),
                        axis: {
                            ticks: {
                                values: saldos.map((ponto) => ponto.rotulo),
                            },
                            tickLabels: compacto
                                ? { thin: false, fontSize: 10 }
                                : { thin: false },
                        },
                    },
                    y: {
                        scale: () => scaleLinear().domain(dominio).nice(),
                        grid: true,
                        axis: {
                            ticks: {
                                format: (valor) => (compacto ? moedaCompacta.format(valor) : moeda.format(valor)),
                            },
                        },
                    },
                },
                tooltip,
            }),
        [compacto, dominio, saldos],
    );

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col rounded-xl border border-sidebar-border/70 bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="h-[280px] w-full min-w-0 shrink-0">
                <Chart definition={chart} height={280} ariaLabel={`Saldo mensal de ${ano}`} />
            </div>
        </div>
    );
}
