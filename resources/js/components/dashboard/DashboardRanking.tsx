import { Trophy } from 'lucide-react';

import DashboardRankingCabecalho from '@/components/dashboard/DashboardRankingCabecalho';
import type { CriterioRanking, ItemRanking } from '@/components/dashboard/types';

type DashboardRankingProps = {
    criterio: CriterioRanking;
    onCriterioChange: (criterio: CriterioRanking) => void;
    itens: ItemRanking[];
};

const COR_TROFEU: Record<number, string> = {
    1: 'text-yellow-500',
    2: 'text-slate-400',
    3: 'text-amber-700',
};

function formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function formatarPercentual(valor: number): string {
    return `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor)}%`;
}

function Trofeu({ posicao }: { posicao: number }) {
    const cor = COR_TROFEU[posicao];

    if (!cor) {
        return <span className="w-6 shrink-0" aria-hidden="true" />;
    }

    return (
        <span className="relative inline-flex w-6 shrink-0 justify-center" aria-label={`${posicao}º lugar`}>
            <Trophy className={`size-6 ${cor}`} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
            <span className="absolute top-[3px] text-[9px] leading-none font-bold text-white">{posicao}</span>
        </span>
    );
}

export default function DashboardRanking({ criterio, onCriterioChange, itens }: DashboardRankingProps) {
    return (
        <div className="border-sidebar-border/70 @container flex h-full min-h-0 min-w-0 flex-col rounded-xl border bg-white p-3 shadow-sm dark:bg-slate-900">
            <DashboardRankingCabecalho criterio={criterio} onCriterioChange={onCriterioChange} />

            {itens.length === 0 ? (
                <div className="text-muted-foreground flex min-h-[12rem] flex-1 items-center justify-center text-sm">Sem lançamentos no mês.</div>
            ) : (
                <div className="flex min-w-0 flex-col">
                    <div className="text-muted-foreground hidden justify-end gap-4 pb-1 text-xs font-medium @[28rem]:flex">
                        <span className="w-24 text-right">Lançamentos</span>
                        <span className="text-foreground w-28 text-right">Valor</span>
                    </div>

                    <ol className="flex flex-col gap-4">
                        {itens.map((item) => (
                            <li key={`${item.posicao}-${item.nome}`} className="flex min-w-0 flex-col gap-2">
                                <div className="flex min-w-0 flex-col gap-1 @[28rem]:flex-row @[28rem]:items-center @[28rem]:gap-4">
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <div className="min-w-0 flex-1 text-sm break-words">
                                            {item.nome} <span className="text-muted-foreground">({formatarPercentual(item.percentual)})</span>
                                        </div>
                                        <Trofeu posicao={item.posicao} />
                                    </div>
                                    <div className="flex items-baseline justify-between gap-4 @[28rem]:justify-end">
                                        <span className="text-muted-foreground text-xs @[28rem]:w-24 @[28rem]:text-right @[28rem]:text-sm">
                                            <span className="@[28rem]:hidden">Lançamentos: </span>
                                            {item.lancamentos}
                                        </span>
                                        <span className="text-sm font-semibold @[28rem]:w-28 @[28rem]:text-right">{formatarMoeda(item.valor)}</span>
                                    </div>
                                </div>
                                <div
                                    className="bg-muted/60 h-2 w-full overflow-hidden rounded-full"
                                    role="progressbar"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={item.percentual}
                                    aria-label={`Participação de ${item.nome}`}
                                >
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-100 to-[#2563eb]"
                                        style={{ width: `${Math.min(100, Math.max(0, item.percentual))}%` }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
