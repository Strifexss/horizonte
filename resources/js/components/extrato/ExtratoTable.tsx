import ExtratoMobileCardList from '@/components/extrato/ExtratoMobileCardList';
import { extratoTableColumns, type ExtratoTableColumn } from '@/components/extrato/ExtratoTableColumns';
import ExtratoTableToolbar from '@/components/extrato/ExtratoTableToolbar';
import ExtratoFooter from '@/components/extrato/Footer';
import type { ExtratoPaginationMeta, ExtratoParcela, ExtratoStatusTab } from '@/components/extrato/types';
import { ArrowDown, ArrowUp } from 'lucide-react';

const SORTABLE_KEYS = ['data', 'descricao', 'quantidade', 'valor', 'valor_pago'];

type ExtratoTableProps = {
    loaded: boolean;
    items: ExtratoParcela[] | null;
    busca: string;
    onBuscaChange: (value: string) => void;
    status: ExtratoStatusTab;
    onStatusChange: (status: ExtratoStatusTab) => void;
    counts: Record<ExtratoStatusTab, number>;
    onEdit: (parcela: ExtratoParcela) => void;
    onDelete: (parcela: ExtratoParcela) => void;
    meta: ExtratoPaginationMeta | null;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    sort: string;
    sortDir: string;
    onSort: (column: string, direction: 'asc' | 'desc') => void;
};

function ExtratoTableSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-slate-700" />
            <div className="h-48 rounded bg-gray-100 dark:bg-slate-800" />
        </div>
    );
}

function ExtratoSortableHeader({
    column,
    sort,
    sortDir,
    onSort,
}: {
    column: ExtratoTableColumn;
    sort: string;
    sortDir: string;
    onSort: (column: string, direction: 'asc' | 'desc') => void;
}) {
    if (!SORTABLE_KEYS.includes(column.key)) {
        return <th className={`px-4 py-3 ${column.thClassName ?? ''}`}>{column.label}</th>;
    }

    const isActive = sort === column.key;

    return (
        <th className={`px-4 py-3 ${column.thClassName ?? ''}`}>
            <div className="flex items-center gap-2">
                <span className="mr-1 text-sm">{column.label}</span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className={`p-0.5 ${isActive && sortDir === 'asc' ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                        onClick={() => onSort(column.key, 'asc')}
                        aria-label={`Ordenar ${column.label} ascendente`}
                    >
                        <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        className={`p-0.5 ${isActive && sortDir === 'desc' ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                        onClick={() => onSort(column.key, 'desc')}
                        aria-label={`Ordenar ${column.label} descendente`}
                    >
                        <ArrowDown className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </th>
    );
}

export default function ExtratoTable({
    loaded,
    items,
    busca,
    onBuscaChange,
    status,
    onStatusChange,
    counts,
    onEdit,
    onDelete,
    meta,
    perPage,
    onPageChange,
    onPerPageChange,
    sort,
    sortDir,
    onSort,
}: ExtratoTableProps) {
    const columns = extratoTableColumns({ onEdit, onDelete });
    const rows = items ?? [];

    return (
        <>
            {!loaded ? (
                <ExtratoTableSkeleton />
            ) : (
                <div className="border-sidebar-border/70 rounded-xl border bg-white shadow-sm dark:bg-slate-900">
                    <div className="border-sidebar-border/70 border-b px-4 py-3">
                        <ExtratoTableToolbar
                            busca={busca}
                            onBuscaChange={onBuscaChange}
                            status={status}
                            onStatusChange={onStatusChange}
                            counts={counts}
                        />
                    </div>
                    <div className="p-3 md:hidden">
                        <ExtratoMobileCardList data={rows} onEdit={onEdit} onDelete={onDelete} />
                    </div>
                    <div className="hidden overflow-x-auto p-4 md:block">
                        <table className="w-full table-auto border-collapse text-sm">
                            <thead>
                                <tr className="text-muted-foreground bg-transparent text-left text-xs">
                                    {columns.map((column) => (
                                        <ExtratoSortableHeader key={column.key} column={column} sort={sort} sortDir={sortDir} onSort={onSort} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((item, rowIndex) => (
                                    <tr key={item.id ?? rowIndex} className="border-t hover:bg-slate-50/50 dark:hover:bg-slate-700/60">
                                        {columns.map((column) => (
                                            <td key={column.key} className={`px-4 py-3 align-top ${column.thClassName ?? ''}`}>
                                                {column.render(item)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ExtratoFooter
                from={meta?.from ?? null}
                to={meta?.to ?? null}
                total={Number(meta?.total ?? counts.todos ?? 0)}
                currentPage={Number(meta?.current_page ?? 1)}
                lastPage={Number(meta?.last_page ?? 1)}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
            />
        </>
    );
}
