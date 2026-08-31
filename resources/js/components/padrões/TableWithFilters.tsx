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
  toolbar?: React.ReactNode;
};

export default function TableWithFilters({ columns, data, tableClassName, toolbar }: Props) {
  return (
    <div className={`overflow-hidden bg-white dark:bg-slate-900 border border-sidebar-border/70 rounded-lg shadow-sm ${tableClassName ?? ''}`}>
      {toolbar ? (
        <div className="border-b border-sidebar-border/70 px-4 py-3">
          {toolbar}
        </div>
      ) : null}
      <div className="overflow-x-auto p-4">
        <table className="w-full table-fixed text-sm border-collapse">
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
    </div>
  );
}

