import React from 'react';

export type CardColumn = {
  key: string;
  label: string;
  render?: (item: any, index: number) => React.ReactNode;
};

type Props = {
  columns: CardColumn[];
  data: any[];
};

export default function CardList({ columns, data }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {data.map((item, rowIndex) => (
        <div key={item.id ?? rowIndex} className="rounded-xl border border-sidebar-border/70 bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="flex flex-col gap-2">
            {columns.map((c) => (
              <div key={c.key} className="flex min-w-0 items-start justify-between gap-3 text-sm">
                <span className="shrink-0 text-xs text-muted-foreground">{c.label}</span>
                <span className="min-w-0 truncate text-right font-medium text-dark">
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
