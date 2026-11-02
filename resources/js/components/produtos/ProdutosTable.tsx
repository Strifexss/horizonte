import { MobileCardList, TableWithFilters, type Column, type SortDirection } from '@/components/padrões';
import ProdutosCard from '@/components/produtos/ProdutosCard';
import ProdutosEmpty from '@/components/produtos/ProdutosEmpty';
import type { ProdutoItem, ProdutoPaginationMeta } from '@/components/produtos/types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Search, Star, Trash2 } from 'lucide-react';

function formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));
}

function alternarFavorito(item: ProdutoItem): void {
    router.patch(route('produtos.favorito', item.id), { favorito: !item.favorito }, { preserveScroll: true });
}

export function FavoritoToggle({ item }: { item: ProdutoItem }) {
    const rotulo = item.favorito ? `Remover ${item.nome} dos favoritos` : `Marcar ${item.nome} como favorito`;

    return (
        <button
            type="button"
            aria-label={rotulo}
            aria-pressed={item.favorito}
            title={rotulo}
            className="hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-md"
            onClick={() => alternarFavorito(item)}
        >
            <Star className={`h-4 w-4 ${item.favorito ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`} />
        </button>
    );
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
    onSort: (column: string, direction: SortDirection) => void;
};

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
    const columns: Column<ProdutoItem>[] = [
        {
            key: 'favorito',
            label: '',
            thClassName: 'w-12',
            render: (item) => <FavoritoToggle item={item} />,
        },
        {
            key: 'nome',
            label: 'Nome',
            sortable: true,
            render: (item) => <span className="font-medium">{item.nome}</span>,
        },
        {
            key: 'codigo',
            label: 'Código',
            sortable: true,
            render: (item) => <span className="text-muted-foreground">{item.codigo ?? '—'}</span>,
        },
        {
            key: 'preco_compra',
            label: 'Preço de compra',
            sortable: true,
            render: (item) => formatCurrency(item.preco_compra),
        },
        {
            key: 'preco_venda',
            label: 'Preço de venda',
            sortable: true,
            render: (item) => formatCurrency(item.preco_venda),
        },
        {
            key: 'ativo',
            label: 'Status',
            sortable: true,
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
        <TableWithFilters
            columns={columns}
            data={rows}
            loaded={loaded}
            toolbar={
                <div className="relative w-full min-w-0">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#aaaaaa]">
                        <Search className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <input
                        type="text"
                        name="search"
                        value={busca}
                        onChange={(e) => onBuscaChange(e.target.value)}
                        placeholder="Buscar por nome ou código..."
                        className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border py-2 pr-3 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                    />
                </div>
            }
            empty={<ProdutosEmpty onAdd={onAdd} />}
            mobile={
                <MobileCardList
                    items={rows}
                    getKey={(item) => item.id}
                    renderContent={(item) => <ProdutosCard item={item} />}
                    onPress={onEdit}
                    actions={(item) => [
                        { key: 'editar', label: 'Editar', icon: <Pencil className="h-4 w-4" />, onClick: () => onEdit(item) },
                        { key: 'excluir', label: 'Excluir', icon: <Trash2 className="h-4 w-4" />, onClick: () => onDelete(item), destructive: true },
                    ]}
                />
            }
            sort={{ column: sort, direction: sortDir, onSort }}
            pagination={{
                from: meta?.from ?? null,
                to: meta?.to ?? null,
                total: Number(meta?.total ?? 0),
                currentPage: Number(meta?.current_page ?? 1),
                lastPage: Number(meta?.last_page ?? 1),
                perPage,
                onPageChange,
                onPerPageChange,
                itemLabel: 'produtos',
            }}
        />
    );
}
