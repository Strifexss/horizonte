const alturas = ['40%', '65%', '30%', '80%', '55%', '45%', '70%', '35%', '60%', '50%', '75%', '42%'];

export default function DashboardSkeleton() {
    return (
        <div
            className="flex h-full min-h-0 min-w-0 flex-col rounded-xl border border-sidebar-border/70 bg-white p-3 shadow-sm dark:bg-slate-900"
            aria-busy="true"
            aria-label="Carregando saldo mensal"
        >
            <div className="mb-2 min-w-0 shrink-0">
                <div className="text-sm font-medium">Saldo mensal</div>
                <div className="h-3 w-10 animate-pulse rounded bg-muted/40" />
            </div>
            <div className="flex h-[280px] shrink-0 items-end gap-2">
                {alturas.map((altura, indice) => (
                    <div key={indice} className="flex h-full flex-1 items-end">
                        <div className="w-full animate-pulse rounded-t bg-muted/40" style={{ height: altura }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
