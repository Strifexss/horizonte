import ExtratoMobileCardList from '@/components/extrato/ExtratoMobileCardList';
import { extratoTableColumns } from '@/components/extrato/ExtratoTableColumns';
import ExtratoTableToolbar from '@/components/extrato/ExtratoTableToolbar';
import type { ExtratoPaginationMeta, ExtratoParcela, ExtratoStatusTab } from '@/components/extrato/types';
import { TableWithFilters, type SortDirection } from '@/components/padrões';

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
    onSort: (column: string, direction: SortDirection) => void;
};

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
    const rows = items ?? [];

    return (
        <TableWithFilters
            columns={extratoTableColumns({ onEdit, onDelete })}
            data={rows}
            loaded={loaded}
            toolbar={
                <ExtratoTableToolbar busca={busca} onBuscaChange={onBuscaChange} status={status} onStatusChange={onStatusChange} counts={counts} />
            }
            mobile={<ExtratoMobileCardList data={rows} onEdit={onEdit} onDelete={onDelete} />}
            sort={{ column: sort, direction: sortDir, onSort }}
            pagination={{
                from: meta?.from ?? null,
                to: meta?.to ?? null,
                total: Number(meta?.total ?? counts.todos ?? 0),
                currentPage: Number(meta?.current_page ?? 1),
                lastPage: Number(meta?.last_page ?? 1),
                perPage,
                onPageChange,
                onPerPageChange,
                itemLabel: 'lançamentos',
            }}
        />
    );
}
