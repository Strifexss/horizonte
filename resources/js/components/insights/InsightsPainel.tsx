import InsightsCard from '@/components/insights/InsightsCard';
import InsightsCarregando from '@/components/insights/InsightsCarregando';
import InsightsResumo from '@/components/insights/InsightsResumo';
import { TIPOS, type AnaliseDashboard, type FiltroInsight, type Insight, type MotivoDispensa, type TipoInsight } from '@/components/insights/types';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
    periodo: string;
    analise: AnaliseDashboard | null;
    carregando: boolean;
    erro: string | null;
    ocupado: boolean;
    onFechar: () => void;
    onGerar: (forcar: boolean) => void;
    onVouFazer: (insight: Insight) => void;
    onDispensar: (insight: Insight, motivo: MotivoDispensa | null) => void;
    onDesfazer: (insight: Insight) => void;
};

function formatarGeracao(iso: string | null): string {
    if (!iso) {
        return '';
    }

    const data = new Date(iso);

    return `gerada em ${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function InsightsPainel({
    periodo,
    analise,
    carregando,
    erro,
    ocupado,
    onFechar,
    onGerar,
    onVouFazer,
    onDispensar,
    onDesfazer,
}: Props) {
    const [filtro, setFiltro] = useState<FiltroInsight>('todos');
    const botaoFechar = useRef<HTMLButtonElement>(null);
    const { setOpen } = useSidebar();

    useEffect(() => {
        setOpen(false);
    }, [setOpen]);

    useEffect(() => {
        botaoFechar.current?.focus();

        function aoTeclar(evento: KeyboardEvent): void {
            if (evento.key === 'Escape') {
                onFechar();
            }
        }

        window.addEventListener('keydown', aoTeclar);

        return () => window.removeEventListener('keydown', aoTeclar);
    }, [onFechar]);

    const filtros = useMemo(() => {
        const insights = analise?.insights ?? [];
        const porTipo = (Object.keys(TIPOS) as TipoInsight[])
            .map((tipo) => ({ id: tipo as FiltroInsight, nome: TIPOS[tipo].filtro, qtd: insights.filter((i) => i.tipo === tipo).length }))
            .filter((item) => item.qtd > 0);

        return [
            { id: 'todos' as FiltroInsight, nome: 'Todos', qtd: insights.length },
            ...porTipo,
            { id: 'lista' as FiltroInsight, nome: 'Minha lista', qtd: insights.filter((i) => i.acao_usuario === 'feito').length },
        ];
    }, [analise]);

    const visiveis = (analise?.insights ?? []).filter((insight) => {
        if (filtro === 'todos') {
            return true;
        }

        return filtro === 'lista' ? insight.acao_usuario === 'feito' : insight.tipo === filtro;
    });

    return (
        <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="insights-titulo"
            className="animate-in fade-in-0 slide-in-from-bottom-2 fixed inset-0 z-40 flex flex-col overflow-hidden bg-slate-50 shadow-xl duration-200 md:inset-y-2 md:right-2 md:left-[calc(var(--sidebar-width-icon)+1rem+2px)] md:rounded-xl dark:bg-slate-950"
        >
            <header className="flex shrink-0 items-center gap-3 border-b bg-white px-4 py-3 md:px-6 md:py-4 dark:bg-slate-900">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#082845] text-amber-500 md:size-10">
                    <Sparkles className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 id="insights-titulo" className="text-base font-semibold md:text-lg">
                        Análise do Dashboard
                    </h2>
                    <p className="text-muted-foreground truncate text-xs md:text-sm">
                        {carregando ? `Analisando ${periodo}…` : [periodo, formatarGeracao(analise?.gerada_em ?? null)].filter(Boolean).join(' · ')}
                    </p>
                </div>
                {analise && !carregando ? (
                    <Button type="button" variant="outline" className="hidden md:inline-flex" disabled={ocupado} onClick={() => onGerar(true)}>
                        <RefreshCw />
                        Gerar novamente
                    </Button>
                ) : null}
                {analise && !carregando ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11 md:hidden"
                        aria-label="Gerar novamente"
                        disabled={ocupado}
                        onClick={() => onGerar(true)}
                    >
                        <RefreshCw />
                    </Button>
                ) : null}
                <Button
                    ref={botaoFechar}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11 md:size-10"
                    aria-label="Fechar análise e voltar ao Dashboard"
                    onClick={onFechar}
                >
                    <X className="size-5" />
                </Button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto flex max-w-6xl flex-col gap-5 p-4 md:p-6">
                    {carregando ? <InsightsCarregando periodo={periodo} /> : null}

                    {!carregando && erro && !analise ? (
                        <div className="border-sidebar-border/70 flex flex-col items-center gap-3 rounded-xl border bg-white p-8 text-center dark:bg-slate-900">
                            <p className="font-semibold">Não foi possível gerar a análise</p>
                            <p className="text-muted-foreground text-sm">{erro}</p>
                            <Button type="button" variant="outline" onClick={() => onGerar(false)}>
                                <RefreshCw />
                                Tentar de novo
                            </Button>
                        </div>
                    ) : null}

                    {!carregando && analise ? (
                        <>
                            <InsightsResumo analise={analise} />

                            {analise.insights.length ? (
                                <>
                                    <div
                                        role="tablist"
                                        aria-label="Filtrar insights"
                                        className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0"
                                    >
                                        {filtros.map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                role="tab"
                                                aria-selected={filtro === item.id}
                                                onClick={() => setFiltro(item.id)}
                                                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold md:h-9 ${
                                                    filtro === item.id
                                                        ? 'border-[#082845] bg-[#082845] text-white'
                                                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900'
                                                }`}
                                            >
                                                {item.nome}
                                                <span
                                                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs ${
                                                        filtro === item.id
                                                            ? 'bg-amber-500 text-[#082845]'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                    }`}
                                                >
                                                    {item.qtd}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {visiveis.length ? (
                                        <div className="grid gap-4 lg:grid-cols-2">
                                            {visiveis.map((insight) => (
                                                <InsightsCard
                                                    key={insight.chave}
                                                    insight={insight}
                                                    ocupado={ocupado}
                                                    onVouFazer={onVouFazer}
                                                    onDispensar={onDispensar}
                                                    onDesfazer={onDesfazer}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground py-6 text-center text-sm">Nenhum insight neste filtro.</p>
                                    )}
                                </>
                            ) : (
                                <p className="border-sidebar-border/70 text-muted-foreground rounded-xl border bg-white p-6 text-center text-sm dark:bg-slate-900">
                                    Nenhum ponto de atenção relevante neste mês.
                                </p>
                            )}

                            <p className="text-muted-foreground pb-2 text-center text-xs">
                                Insights gerados por IA a partir dos números do seu Dashboard. Confira antes de tomar decisões.
                            </p>
                        </>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
