import TablePagination, { type TablePaginationProps } from '@/components/padrões/TablePagination';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { ReactNode } from 'react';

export type Column<T> = {
    key: string;
    label: string;
    /** Classe do `th`; também vai para o `td` quando `className` não é informado. */
    thClassName?: string;
    className?: string;
    sortable?: boolean;
    render?: (item: T, index: number) => ReactNode;
};

export type SortDirection = 'asc' | 'desc';

export type TableSort = {
    column: string;
    direction: string;
    onSort: (column: string, direction: SortDirection) => void;
};

type Props<T> = {
    columns: Column<T>[];
    data: T[];
    rowKey?: (item: T, index: number) => string | number;
    /** Enquanto `false`, mostra o `skeleton` no lugar do card. */
    loaded?: boolean;
    skeleton?: ReactNode;
    /** Busca, abas de status etc., no topo do card. */
    toolbar?: ReactNode;
    /** Lista do mobile. Sem ela, a tabela aparece em todas as larguras. */
    mobile?: ReactNode;
    /** Substitui tabela e lista quando `data` está vazio. */
    empty?: ReactNode;
    sort?: TableSort;
    pagination?: TablePaginationProps;
    onRowClick?: (item: T) => void;
    fixedLayout?: boolean;
};

function TableSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-slate-700" />
            <div className="h-48 rounded bg-gray-100 dark:bg-slate-800" />
        </div>
    );
}

function HeaderCell<T>({ column, sort }: { column: Column<T>; sort?: TableSort }) {
    if (!column.sortable || !sort) {
        return <th className={cn('px-4 py-3', column.thClassName)}>{column.label}</th>;
    }

    const isActive = sort.column === column.key;

    return (
        <th className={cn('px-4 py-3', column.thClassName)}>
            <div className="flex items-center gap-2">
                <span className="mr-1 text-sm">{column.label}</span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className={`p-0.5 ${isActive && sort.direction === 'asc' ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                        onClick={() => sort.onSort(column.key, 'asc')}
                        aria-label={`Ordenar ${column.label} ascendente`}
                    >
                        <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        className={`p-0.5 ${isActive && sort.direction === 'desc' ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                        onClick={() => sort.onSort(column.key, 'desc')}
                        aria-label={`Ordenar ${column.label} descendente`}
                    >
                        <ArrowDown className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </th>
    );
}

function cellContent<T>(column: Column<T>, item: T, index: number): ReactNode {
    if (column.render) {
        return column.render(item, index);
    }

    return String((item as Record<string, unknown>)[column.key] ?? '');
}

function defaultRowKey<T>(item: T, index: number): string | number {
    const id = (item as { id?: unknown }).id;

    return typeof id === 'string' || typeof id === 'number' ? id : index;
}

export default function TableWithFilters<T>({
    columns,
    data,
    rowKey = defaultRowKey,
    loaded = true,
    skeleton,
    toolbar,
    mobile,
    empty,
    sort,
    pagination,
    onRowClick,
    fixedLayout = false,
}: Props<T>) {
    const showEmpty = empty !== undefined && data.length === 0;

    return (
        <>
            {!loaded ? (
                (skeleton ?? <TableSkeleton />)
            ) : (
                <div className="border-sidebar-border/70 rounded-xl border bg-white shadow-sm dark:bg-slate-900">
                    {toolbar ? <div className="border-sidebar-border/70 border-b px-4 py-3">{toolbar}</div> : null}
                    {showEmpty ? (
                        <div className="p-4">{empty}</div>
                    ) : (
                        <>
                            {mobile ? <div className="p-3 md:hidden">{mobile}</div> : null}
                            <div className={cn('overflow-x-auto p-4', mobile && 'hidden md:block')}>
                                <table className={cn('w-full border-collapse text-sm', fixedLayout ? 'table-fixed' : 'table-auto')}>
                                    <thead>
                                        <tr className="text-muted-foreground bg-transparent text-left text-xs">
                                            {columns.map((column) => (
                                                <HeaderCell key={column.key} column={column} sort={sort} />
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, rowIndex) => (
                                            <tr
                                                key={rowKey(item, rowIndex)}
                                                className={cn(
                                                    'border-t hover:bg-slate-50/50 dark:hover:bg-slate-700/60',
                                                    onRowClick && 'cursor-pointer',
                                                )}
                                                onClick={onRowClick ? () => onRowClick(item) : undefined}
                                            >
                                                {columns.map((column) => (
                                                    <td
                                                        key={column.key}
                                                        className={cn('px-4 py-3 align-top', column.className ?? column.thClassName)}
                                                    >
                                                        {cellContent(column, item, rowIndex)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {pagination ? <TablePagination {...pagination} /> : null}
        </>
    );
}
