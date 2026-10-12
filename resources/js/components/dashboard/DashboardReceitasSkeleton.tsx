const alturas = ['55%', '30%', '75%', '40%', '60%', '25%', '50%'];

export default function DashboardReceitasSkeleton() {
    return (
        <div
            className="flex h-full min-h-0 min-w-0 flex-col rounded-xl border border-sidebar-border/70 bg-white p-4 shadow-sm dark:bg-slate-900"
            aria-busy="true"
            aria-label="Carregando receitas por dia da semana"
        >
            <div className="mb-2 h-10 w-full animate-pulse rounded bg-muted/40" />
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
