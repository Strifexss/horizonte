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
        <div className="relative rounded-lg border border-sidebar-border/70 bg-white p-4 shadow-sm dark:bg-slate-900">
            <div>
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="mt-2 text-2xl font-semibold">{value}</div>
                {hint ? <div className="mt-2 text-xs text-muted-foreground">{hint}</div> : null}
            </div>
            {icon ? (
                <div className="pointer-events-none absolute top-1/2 right-4 hidden h-12 w-12 -translate-y-1/2 items-center justify-center opacity-30 sm:flex dark:opacity-20">
                    {icon}
                </div>
            ) : null}
        </div>
    );
}
