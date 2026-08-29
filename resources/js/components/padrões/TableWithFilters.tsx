import React from 'react';

export type Column = {
  key: string;
  label: string;
  className?: string;
  thClassName?: string;
  // Optional cell renderer: receives the row item and index, should return ReactNode
  render?: (item: any, index: number) => React.ReactNode;
};

type Props = {
  columns: Column[];
  data: any[];
  tableClassName?: string;
};

export default function TableWithFilters({ columns, data, tableClassName }: Props) {
  return (
    <div className={`overflow-x-auto bg-white dark:bg-slate-900 border border-sidebar-border/70 rounded-lg p-4 shadow-sm ${tableClassName ?? ''}`}>
      <table className="w-full min-w-[1000px] table-fixed text-sm border-collapse">
        <thead>
          <tr className="text-left text-xs text-muted-foreground bg-transparent">
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-3 ${c.thClassName ?? ''}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={item.id ?? rowIndex} className="border-t hover:bg-slate-50/50 dark:hover:bg-slate-700/60">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 align-top ${c.className ?? ''}`}>
                  {c.render ? c.render(item, rowIndex) : String(item[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

