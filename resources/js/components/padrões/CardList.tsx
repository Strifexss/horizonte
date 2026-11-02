import React from 'react';

export type CardColumn = {
    key: string;
    label: string;
    render?: (item: Record<string, unknown>, index: number) => React.ReactNode;
};

type Props = {
    columns: CardColumn[];
    data: Record<string, unknown>[];
};

export default function CardList({ columns, data }: Props) {
    return (
        <div className="flex flex-col gap-3">
            {data.map((item, rowIndex) => (
                <div
                    key={typeof item.id === 'string' || typeof item.id === 'number' ? item.id : rowIndex}
                    className="border-sidebar-border/70 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900"
                >
                    <div className="flex flex-col gap-2">
                        {columns.map((c) => (
                            <div key={c.key} className="flex min-w-0 items-start justify-between gap-3 text-sm">
                                <span className="text-muted-foreground shrink-0 text-xs">{c.label}</span>
                                <span className="text-dark min-w-0 truncate text-right font-medium">
                                    {c.render ? c.render(item, rowIndex) : String(item[c.key] ?? '')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
