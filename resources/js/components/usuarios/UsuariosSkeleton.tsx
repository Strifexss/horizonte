export default function UsuariosSkeleton() {
    const linhas = Array.from({ length: 5 });

    return (
        <div className="border-sidebar-border/40 flex flex-col gap-3 rounded-lg border bg-white/40 p-4 dark:bg-slate-800/60">
            {linhas.map((_, index) => (
                <div key={index} className="flex animate-pulse items-center gap-4">
                    <div className="flex-1">
                        <div className="bg-muted/30 mb-2 h-4 w-1/3 rounded" />
                        <div className="bg-muted/20 h-3 w-1/2 rounded" />
                    </div>
                    <div className="bg-muted/30 h-8 w-8 rounded" />
                </div>
            ))}
        </div>
    );
}
