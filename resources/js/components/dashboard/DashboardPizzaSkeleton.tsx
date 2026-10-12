import DashboardFiltroPeriodo from '@/components/dashboard/DashboardFiltroPeriodo';

type DashboardPizzaSkeletonProps = {
    dataInicio: string;
    dataFim: string;
    onPeriodoChange: (inicio: string, fim: string) => void;
};

export default function DashboardPizzaSkeleton({ dataInicio, dataFim, onPeriodoChange }: DashboardPizzaSkeletonProps) {
    return (
        <div
            className="@container flex h-full min-h-0 min-w-0 flex-col rounded-xl border border-sidebar-border/70 bg-white p-3 shadow-sm dark:bg-slate-900"
            aria-busy="true"
            aria-label="Carregando despesas por categoria"
        >
            <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2">
                <div className="min-w-0">
                    <div className="text-sm font-medium">Despesas por categoria</div>
                    <div className="text-xs text-muted-foreground">Competência</div>
                </div>
                <DashboardFiltroPeriodo dataInicio={dataInicio} dataFim={dataFim} onPeriodoChange={onPeriodoChange} />
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
                <div className="aspect-square min-h-[12rem] w-full max-h-[16rem] max-w-full flex-1 animate-pulse rounded-full bg-muted/40 @[26rem]:max-h-none" />
                <div className="flex w-full shrink-0 flex-col gap-2">
                    <div className="h-3 w-full animate-pulse rounded bg-muted/40" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-muted/40" />
                    <div className="h-3 w-4/6 animate-pulse rounded bg-muted/40" />
                </div>
            </div>
        </div>
    );
}
