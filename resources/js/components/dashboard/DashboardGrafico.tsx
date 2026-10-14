import { useEffect, useMemo, useState } from 'react';
import { barY, defineChart } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/charts/react';
import type { PontoMensal } from '@/components/dashboard/types';

type DashboardGraficoProps = {
    ano: number;
    titulo: string;
    pontos: PontoMensal[];
    cor: string;
    corPorSinal?: boolean;
    mensagemVazio: string;
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

function dominioValor(pontos: readonly PontoMensal[]): [number, number] {
    let minimo = 0;
    let maximo = 0;

    for (const ponto of pontos) {
        minimo = Math.min(minimo, ponto.valor);
        maximo = Math.max(maximo, ponto.valor);
    }

    if (minimo === maximo) {
        return [minimo, maximo + 1];
    }

    return [minimo, maximo];
}

function serieVazia(pontos: readonly PontoMensal[]): boolean {
    return pontos.every((ponto) => ponto.valor === 0);
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

export default function DashboardGrafico({
    ano,
    titulo,
    pontos,
    cor,
    corPorSinal = false,
    mensagemVazio,
}: DashboardGraficoProps) {
    const dominio = useMemo(() => dominioValor(pontos), [pontos]);
    const compacto = useEixoCompacto();
    const vazio = serieVazia(pontos);

    const chart = useMemo(
        () =>
            defineChart({
                marks: [
                    barY(pontos, {
                        x: 'rotulo',
                        y: 'valor',
                        fill: (ponto) => (corPorSinal ? (ponto.valor < 0 ? COR_NEGATIVO : COR_POSITIVO) : cor),
                    }),
                ],
                scales: {
                    x: {
                        scale: () => scaleBand<string>().padding(0.2),
                        axis: {
                            ticks: {
                                values: pontos.map((ponto) => ponto.rotulo),
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
        [compacto, cor, corPorSinal, dominio, pontos],
    );

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col rounded-xl border border-sidebar-border/70 bg-white p-3 shadow-sm dark:bg-slate-900">
            <div className="mb-2 min-w-0 shrink-0">
                <div className="text-sm font-medium">{titulo}</div>
                <div className="text-xs text-muted-foreground">{ano}</div>
            </div>
            {vazio ? (
                <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                    {mensagemVazio}
                </div>
            ) : (
                <div className="h-[280px] w-full min-w-0 shrink-0">
                    <Chart definition={chart} height={280} ariaLabel={`${titulo} de ${ano}`} />
                </div>
            )}
        </div>
    );
}
