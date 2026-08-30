import React from 'react';

export default function AccountsSkeleton() {
    const items = Array.from({ length: 6 });
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((_, i) => (
                <div
                    key={i}
                    className="rounded-lg border bg-white/40 dark:bg-slate-800/60 border-sidebar-border/40 p-6 animate-pulse"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted/30" />
                        <div className="flex-1 min-w-0">
                            <div className="h-4 w-3/4 rounded bg-muted/30 mb-2" />
                            <div className="h-3 w-1/2 rounded bg-muted/20" />
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="h-6 w-1/3 rounded bg-muted/30 mb-2" />
                        <div className="h-3 w-1/2 rounded bg-muted/20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

