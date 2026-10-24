import { formatarReais, type AnaliseDashboard } from '@/components/insights/types';
import { Check } from 'lucide-react';

type Props = {
    analise: AnaliseDashboard;
};

const SITUACOES = {
    melhorou: 'text-green-700 dark:text-green-300',
    piorou: 'text-red-700 dark:text-red-300',
    sem_mudanca: 'text-slate-600 dark:text-slate-300',
    sem_dados: 'text-slate-600 dark:text-slate-300',
};

export default function InsightsResumo({ analise }: Props) {
    const ganho = analise.insights
        .filter((i) => i.tipo === 'crescimento' || i.tipo === 'lucro')
        .reduce((soma, i) => soma + Math.max(i.impacto_valor, 0), 0);
    const economia = analise.insights.filter((i) => i.tipo === 'custos').reduce((soma, i) => soma + Math.abs(i.impacto_valor), 0);
    const alertas = analise.insights.filter((i) => i.tipo === 'alerta').length;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-[2_1_420px] flex-col gap-2 rounded-xl bg-[#082845] p-5 text-white">
                    <span className="text-xs font-semibold tracking-[0.1em] text-amber-400">RESUMO DO MÊS</span>
                    <p className="text-[15px] leading-6">{analise.resumo}</p>
                </div>
                <div className="grid flex-[1_1_260px] gap-2">
                    <div className="border-sidebar-border/70 flex items-center justify-between gap-3 rounded-lg border bg-white px-3.5 py-2.5 dark:bg-slate-900">
                        <span className="text-muted-foreground text-sm">Mais receita e lucro</span>
                        <strong className="text-lg text-green-700 tabular-nums dark:text-green-300">
                            {ganho > 0 ? `+${formatarReais(ganho)}` : '—'}
                        </strong>
                    </div>
                    <div className="border-sidebar-border/70 flex items-center justify-between gap-3 rounded-lg border bg-white px-3.5 py-2.5 dark:bg-slate-900">
                        <span className="text-muted-foreground text-sm">Custos a reduzir</span>
                        <strong className="text-lg text-blue-700 tabular-nums dark:text-blue-300">
                            {economia > 0 ? formatarReais(economia) : '—'}
                        </strong>
                    </div>
                    <div className="border-sidebar-border/70 flex items-center justify-between gap-3 rounded-lg border bg-white px-3.5 py-2.5 dark:bg-slate-900">
                        <span className="text-muted-foreground text-sm">Alertas</span>
                        <strong className="text-lg text-red-700 dark:text-red-300">{alertas}</strong>
                    </div>
                </div>
            </div>

            {analise.resultados_acoes.length ? (
                <div className="flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 p-4 md:px-5 dark:border-green-900 dark:bg-green-950/30">
                    <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-green-700 dark:text-green-300">
                        <Check className="size-4" />
                        RESULTADO DO QUE VOCÊ FEZ
                    </p>
                    {analise.resultados_acoes.map((resultado) => (
                        <p key={resultado.titulo} className="text-sm">
                            <strong className="font-semibold">{resultado.titulo}:</strong>{' '}
                            <span className={SITUACOES[resultado.situacao]}>{resultado.explicacao}</span>
                        </p>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
