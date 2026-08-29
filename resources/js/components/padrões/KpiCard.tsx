import React from 'react';

type KpiItem = {
  id?: string | number;
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  color?: 'green' | 'red' | 'teal' | 'muted';
};

export default function KpiCard({ label, value, hint, icon }: KpiItem) {
  return (
    <div className="relative rounded-lg border border-sidebar-border/70 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
        {hint ? <div className="mt-2 text-xs text-muted-foreground">{hint}</div> : null}
      </div>
      {icon ? (
        <div className="pointer-events-none absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center opacity-30 dark:opacity-20 sm:flex">
          {icon}
        </div>
      ) : null}
    </div>
  );
}

