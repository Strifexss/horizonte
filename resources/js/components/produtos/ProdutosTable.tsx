import { useState, type ReactNode } from 'react';
import ProdutosCard from '@/components/produtos/ProdutosCard';
import ProdutosEmpty from '@/components/produtos/ProdutosEmpty';
import ProdutosPagination from '@/components/produtos/ProdutosPagination';
import ProdutosSkeleton from '@/components/produtos/ProdutosSkeleton';
import type { ProdutoItem, ProdutoPaginationMeta } from '@/components/produtos/types';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ArrowDown, ArrowUp, MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SORTABLE_KEYS = ['nome', 'preco_compra', 'preco_venda', 'ativo'];

type Column = {
    key: string;
    label: string;
    thClassName?: string;
    render: (item: ProdutoItem) => ReactNode;
};

function formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));
}

type Props = {
    loaded: boolean;
    items: ProdutoItem[] | null;
    busca: string;
    onBuscaChange: (value: string) => void;
    onEdit: (item: ProdutoItem) => void;
    onDelete: (item: ProdutoItem) => void;
    onAdd: () => void;
    meta: ProdutoPaginationMeta | null;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    sort: string;
    sortDir: string;
    onSort: (column: string, direction: 'asc' | 'desc') => void;
};

function SortableHeader({
    column,
    sort,
    sortDir,
    onSort,
}: {
    column: Column;
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

export default function ProdutosTable({
    loaded,
    items,
    busca,
    onBuscaChange,
    onEdit,
    onDelete,
    onAdd,
    meta,
    perPage,
    onPageChange,
    onPerPageChange,
    sort,
    sortDir,
    onSort,
}: Props) {
    const rows = items ?? [];
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const columns: Column[] = [
        {
            key: 'nome',
            label: 'Nome',
            render: (item) => <span className="font-medium">{item.nome}</span>,
        },
        {
            key: 'preco_compra',
            label: 'Preço de compra',
            render: (item) => formatCurrency(item.preco_compra),
        },
        {
            key: 'preco_venda',
            label: 'Preço de venda',
            render: (item) => formatCurrency(item.preco_venda),
        },
        {
            key: 'ativo',
            label: 'Status',
            render: (item) => (item.ativo ? 'Ativo' : 'Inativo'),
        },
        {
            key: 'acoes',
            label: 'Ações',
            thClassName: 'w-24 text-right',
            render: (item) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => onEdit(item)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onDelete(item)}>Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <>
            {!loaded ? (
                <ProdutosSkeleton />
            ) : (
                <div className="rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:bg-slate-900">
                    <div className="border-b border-sidebar-border/70 px-4 py-3">
                        <div className="relative w-full min-w-0">
                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#aaaaaa]">
                                <Search className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <input
                                type="text"
                                name="search"
                                value={busca}
                                onChange={(e) => onBuscaChange(e.target.value)}
                                placeholder="Buscar produto..."
                                className="h-10 w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
                            />
                        </div>
                    </div>
                    {rows.length === 0 ? (
                        <div className="p-4">
                            <ProdutosEmpty onAdd={onAdd} />
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-2 p-3 md:hidden">
                                {rows.map((item) => (
                                    <ProdutosCard
                                        key={item.id}
                                        item={item}
                                        expanded={expandedId === item.id}
                                        onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                                        onEdit={(current) => {
                                            setExpandedId(null);
                                            onEdit(current);
                                        }}
                                        onDelete={(current) => {
                                            setExpandedId(null);
                                            onDelete(current);
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="hidden overflow-x-auto p-4 md:block">
                                <table className="w-full table-auto border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-transparent text-left text-xs text-muted-foreground">
                                            {columns.map((column) => (
                                                <SortableHeader
                                                    key={column.key}
                                                    column={column}
                                                    sort={sort}
                                                    sortDir={sortDir}
                                                    onSort={onSort}
                                                />
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((item) => (
                                            <tr key={item.id} className="border-t hover:bg-slate-50/50 dark:hover:bg-slate-700/60">
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
                        </>
                    )}
                </div>
            )}

            <ProdutosPagination
                from={meta?.from ?? null}
                to={meta?.to ?? null}
                total={Number(meta?.total ?? 0)}
                currentPage={Number(meta?.current_page ?? 1)}
                lastPage={Number(meta?.last_page ?? 1)}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
            />
        </>
    );
}
