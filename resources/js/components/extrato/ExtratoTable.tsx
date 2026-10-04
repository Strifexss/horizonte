import ExtratoFooter from '@/components/extrato/Footer';
import ExtratoMobileCardList from '@/components/extrato/ExtratoMobileCardList';
import ExtratoTableToolbar from '@/components/extrato/ExtratoTableToolbar';
import { extratoTableColumns } from '@/components/extrato/ExtratoTableColumns';
import type { ExtratoPaginationMeta, ExtratoParcela, ExtratoStatusTab } from '@/components/extrato/types';

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
};

function ExtratoTableSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-slate-700" />
            <div className="h-48 rounded bg-gray-100 dark:bg-slate-800" />
        </div>
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
}: ExtratoTableProps) {
    const columns = extratoTableColumns({ onEdit, onDelete });
    const rows = items ?? [];

    return (
        <>
            {!loaded ? (
                <ExtratoTableSkeleton />
            ) : (
                <div className="rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:bg-slate-900">
                    <div className="border-b border-sidebar-border/70 px-4 py-3">
                        <ExtratoTableToolbar
                            busca={busca}
                            onBuscaChange={onBuscaChange}
                            status={status}
                            onStatusChange={onStatusChange}
                            counts={counts}
                        />
                    </div>
                    <div className="p-3 md:hidden">
                        <ExtratoMobileCardList data={rows} onEdit={onEdit} />
                    </div>
                    <div className="hidden overflow-x-auto p-4 md:block">
                        <table className="w-full table-auto border-collapse text-sm">
                            <thead>
                                <tr className="bg-transparent text-left text-xs text-muted-foreground">
                                    {columns.map((column) => (
                                        <th key={column.key} className={`px-4 py-3 ${column.thClassName ?? ''}`}>
                                            {column.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((item, rowIndex) => (
                                    <tr
                                        key={item.id ?? rowIndex}
                                        className="border-t hover:bg-slate-50/50 dark:hover:bg-slate-700/60"
                                    >
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={`px-4 py-3 align-top ${column.thClassName ?? ''}`}
                                            >
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
