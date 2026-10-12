import { defineChart } from '@tanstack/charts';
import { pie, polar, radialArc } from '@tanstack/charts/polar';
import { Chart as ReactChart } from '@tanstack/charts/react';
import { tooltip } from '@tanstack/charts/tooltip';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';

import DashboardFiltroPeriodo from '@/components/dashboard/DashboardFiltroPeriodo';
import type { FatiaPizza } from '@/components/dashboard/types';

type DashboardPizzaProps = {
    titulo: string;
    fatias: FatiaPizza[];
    dataInicio: string;
    dataFim: string;
    onPeriodoChange: (inicio: string, fim: string) => void;
};

const PALETTE = [
    '#0ea5e9',
    '#6366f1',
    '#a855f7',
    '#ec4899',
    '#f97316',
    '#22c55e',
    '#64748b',
    '#f43f5e',
    '#14b8a6',
    '#eab308',
];

function formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function useLadoDoContainer(): { ref: RefObject<HTMLDivElement | null>; lado: number } {
    const ref = useRef<HTMLDivElement>(null);
    const [lado, setLado] = useState(0);

    useEffect(() => {
        const el = ref.current;

        if (!el) {
            return;
        }

        const medir = (): void => {
            const { width, height } = el.getBoundingClientRect();
            const largura = Math.max(0, Math.floor(width));
            const altura = Math.max(0, Math.floor(height));

            setLado(altura > 8 ? Math.min(largura, altura) : largura);
        };

        medir();
        const observer = new ResizeObserver(medir);
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return { ref, lado };
}

export default function DashboardPizza({
    titulo,
    fatias,
    dataInicio,
    dataFim,
    onPeriodoChange,
}: DashboardPizzaProps) {
    const { ref: donutRef, lado } = useLadoDoContainer();

    const total = useMemo(() => fatias.reduce((acc, item) => acc + (item.valor ?? 0), 0), [fatias]);

    const rotulos = useMemo(() => fatias.map((item) => item.rotulo), [fatias]);

    const chart = useMemo(() => {
        const slices = pie(fatias, { value: (d) => Math.max(0, d.valor) });

        return defineChart({
            marks: [
                polar({
                    inset: 4,
                    radiusRatio: 0.96,
                    marks: [
                        radialArc(slices, {
                            innerRadius: ({ radius }) => radius * 0.58,
                            cornerRadius: 3,
                            key: 'rotulo',
                            color: 'rotulo',
                        }),
                    ],
                    scales: {
                        angle: null,
                        radius: null,
                    },
                }),
            ],
            tooltip,
            scales: {
                x: null,
                y: null,
            },
            color: {
                domain: rotulos,
                range: PALETTE,
            },
        });
    }, [fatias, rotulos]);

    return (
        <div className="@container flex h-full min-h-0 min-w-0 flex-col rounded-xl border border-sidebar-border/70 bg-white p-3 shadow-sm dark:bg-slate-900">
            <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2">
                <div className="min-w-0">
                    <div className="text-sm font-medium">{titulo}</div>
                    <div className="text-xs text-muted-foreground">Competência</div>
                </div>
                <DashboardFiltroPeriodo dataInicio={dataInicio} dataFim={dataFim} onPeriodoChange={onPeriodoChange} />
            </div>

            {total <= 0 ? (
                <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-muted-foreground">
                    Sem despesas no período.
                </div>
            ) : (
                <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 @[26rem]:flex-row @[26rem]:items-stretch">
                    <div
                        ref={donutRef}
                        className="flex aspect-square w-full min-h-[12rem] max-h-[16rem] min-w-0 items-center justify-center @[26rem]:aspect-auto @[26rem]:h-auto @[26rem]:max-h-none @[26rem]:min-h-0 @[26rem]:flex-1"
                    >
                        {lado > 0 ? (
                            <ReactChart definition={chart} width={lado} height={lado} ariaLabel={titulo} />
                        ) : null}
                    </div>

                    <div className="grid w-full shrink-0 grid-cols-1 gap-x-3 gap-y-1.5 @[18rem]:grid-cols-2 @[26rem]:w-[11.5rem] @[26rem]:grid-cols-1">
                        {fatias.map((item, idx) => {
                            const percent = total > 0 ? (item.valor / total) * 100 : 0;
                            const cor = PALETTE[idx % PALETTE.length];

                            return (
                                <div key={item.rotulo} className="flex min-w-0 items-start gap-1.5">
                                    <span
                                        className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                                        style={{ backgroundColor: cor }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs leading-snug break-words">{item.rotulo}</div>
                                        <div className="flex flex-wrap items-baseline gap-x-1.5 text-[11px] leading-snug">
                                            <span className="text-muted-foreground">{formatarMoeda(item.valor)}</span>
                                            <span className="font-medium">{percent.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
