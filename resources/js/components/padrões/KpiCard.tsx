import type { ReactNode } from 'react';

export type KpiItem = {
    id?: string | number;
    label: string;
    value: ReactNode;
    hint?: string;
    icon?: ReactNode;
    color?: 'green' | 'red' | 'teal' | 'muted';
};

export default function KpiCard({ label, value, hint, icon }: KpiItem) {
    return (
        <div className="relative shrink-0 rounded-lg border border-sidebar-border/70 bg-white p-2.5 shadow-sm md:p-4 dark:bg-slate-900">
            <div>
                <div className="text-[11px] leading-tight text-muted-foreground md:text-sm">{label}</div>
                <div className="mt-1 text-xs font-bold md:mt-2 md:text-2xl md:font-semibold">{value}</div>
                {hint ? <div className="mt-1 hidden text-xs text-muted-foreground md:mt-2 md:block">{hint}</div> : null}
            </div>
            {icon ? (
                <div className="pointer-events-none absolute top-1/2 right-4 hidden h-12 w-12 -translate-y-1/2 items-center justify-center opacity-30 md:flex dark:opacity-20">
                    {icon}
                </div>
            ) : null}
        </div>
    );
}
