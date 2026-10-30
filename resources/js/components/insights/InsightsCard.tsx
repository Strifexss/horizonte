import { MOTIVOS, PRIORIDADES, TIPOS, formatarReais, type Insight, type MotivoDispensa } from '@/components/insights/types';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, Check, CircleDollarSign, Eye, TrendingDown, TrendingUp } from 'lucide-react';

type Props = {
    insight: Insight;
    ocupado: boolean;
    onVouFazer: (insight: Insight) => void;
    onDispensar: (insight: Insight, motivo: MotivoDispensa | null) => void;
    onDesfazer: (insight: Insight) => void;
};

const ICONES = {
    crescimento: TrendingUp,
    lucro: CircleDollarSign,
    custos: TrendingDown,
    alerta: AlertTriangle,
    positivo: Eye,
};

export default function InsightsCard({ insight, ocupado, onVouFazer, onDispensar, onDesfazer }: Props) {
    const tipo = TIPOS[insight.tipo];
    const Icone = ICONES[insight.tipo];

    if (insight.acao_usuario === 'dispensado') {
        return (
            <article className="flex flex-col gap-2.5 self-start rounded-xl border border-dashed border-slate-300 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-muted-foreground min-w-0 text-sm">
                        Dispensado: <span className="text-foreground font-medium">{insight.titulo}</span>
                    </p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-blue-700"
                        disabled={ocupado}
                        onClick={() => onDesfazer(insight)}
                    >
                        Desfazer
                    </Button>
                </div>
                {insight.motivo_usuario ? (
                    <p className="text-muted-foreground text-xs">
                        Motivo: <strong className="text-foreground font-semibold">{MOTIVOS[insight.motivo_usuario]}</strong>. Vamos levar isso em
                        conta nas próximas análises.
                    </p>
                ) : (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground text-xs font-semibold">Por quê? (opcional)</span>
                        {(Object.keys(MOTIVOS) as MotivoDispensa[]).map((motivo) => (
                            <button
                                key={motivo}
                                type="button"
                                disabled={ocupado}
                                onClick={() => onDispensar(insight, motivo)}
                                className="h-9 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                            >
                                {MOTIVOS[motivo]}
                            </button>
                        ))}
                    </div>
                )}
            </article>
        );
    }

    return (
        <article className="border-sidebar-border/70 flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ${tipo.selo}`}>
                    <Icone className="size-3.5" />
                    {tipo.nome}
                </span>
                <span className={`text-xs font-semibold ${insight.prioridade === 'alta' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {PRIORIDADES[insight.prioridade]}
                </span>
            </div>
            <h3 className="text-base leading-snug font-semibold">{insight.titulo}</h3>
            <p className="text-muted-foreground text-sm">{insight.explicacao}</p>

            <div className="flex flex-col gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-3 text-sm dark:border-slate-800 dark:bg-slate-800/50">
                {insight.impacto_valor !== 0 ? (
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-muted-foreground text-xs font-semibold">{insight.impacto_rotulo}</span>
                        <strong className={`text-lg tabular-nums ${tipo.impacto}`}>{formatarReais(insight.impacto_valor)}</strong>
                    </div>
                ) : null}
                <div className="flex gap-2">
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-blue-700" />
                    <span>
                        <strong className="font-semibold">O que fazer:</strong> {insight.acao}
                    </span>
                </div>
            </div>

            {insight.acao_usuario === 'feito' ? (
                <div className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 py-1 pr-1 pl-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
                    <Check className="size-4 shrink-0" />
                    <span className="flex-1">Na sua lista. Vamos conferir o resultado na próxima análise.</span>
                    <Button type="button" variant="ghost" size="sm" disabled={ocupado} onClick={() => onDesfazer(insight)}>
                        Desfazer
                    </Button>
                </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-muted-foreground text-xs">Baseado em: {insight.base}</span>
                {insight.acao_usuario === null ? (
                    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                        <Button type="button" variant="outline" className="h-11 sm:h-9" disabled={ocupado} onClick={() => onDispensar(insight, null)}>
                            Dispensar
                        </Button>
                        <Button
                            type="button"
                            className="h-11 bg-[#082845] text-white hover:bg-[#0d3a63] sm:h-9"
                            disabled={ocupado}
                            onClick={() => onVouFazer(insight)}
                        >
                            <Check />
                            Vou fazer
                        </Button>
                    </div>
                ) : null}
            </div>
        </article>
    );
}
