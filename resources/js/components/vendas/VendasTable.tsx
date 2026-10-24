import { MobileCardList, TableWithFilters, type Column, type MobileCardAction } from '@/components/padrões';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    VENDA_STATUS_META,
    formatCurrency,
    formatDataVenda,
    formatQuantidade,
    parseQuantidade,
    type Venda,
    type VendaPaginationMeta,
} from '@/components/vendas/types';
import { Ban, Eye, MoreHorizontal, Pencil, Plus, ShoppingCart } from 'lucide-react';

type Props = {
    loaded: boolean;
    items: Venda[] | null;
    meta: VendaPaginationMeta | null;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onOpen: (venda: Venda) => void;
    onCancelar: (venda: Venda) => void;
    onAdd: () => void;
};

function resumoItens(venda: Venda): string {
    return venda.itens.map((item) => `${item.produto?.nome ?? 'Produto'} × ${formatQuantidade(parseQuantidade(item.quantidade))}`).join(', ');
}

function resumoPagamentos(venda: Venda): string {
    return [...new Set(venda.pagamentos.map((pagamento) => pagamento.forma_pagamento?.nome).filter(Boolean))].join(', ');
}

function StatusBadge({ venda }: { venda: Venda }) {
    const meta = VENDA_STATUS_META[venda.status];

    return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${meta.className}`}>{meta.label}</span>;
}

function AcoesVenda({ venda, onOpen, onCancelar }: { venda: Venda; onOpen: Props['onOpen']; onCancelar: Props['onCancelar'] }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label={`Ações da venda #${venda.id}`}
                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md p-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onSelect={() => onOpen(venda)}>
                    {venda.status === 'aberta' ? <Pencil className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {venda.status === 'aberta' ? 'Editar' : 'Ver'}
                </DropdownMenuItem>
                {venda.status !== 'cancelada' ? (
                    <DropdownMenuItem onSelect={() => onCancelar(venda)}>
                        <Ban className="mr-2 h-4 w-4 text-red-600" />
                        Cancelar venda
                    </DropdownMenuItem>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function VendasEmpty({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center gap-3 p-6 text-center">
            <ShoppingCart className="text-muted-foreground h-10 w-10" />
            <p className="text-muted-foreground text-sm">Nenhuma venda encontrada no período.</p>
            <Button variant="primary" className="inline-flex items-center gap-2" onClick={onAdd}>
                <Plus className="h-4 w-4" />
                Nova venda
            </Button>
        </div>
    );
}

function VendaCardContent({ venda }: { venda: Venda }) {
    return (
        <>
            <div className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Venda #{venda.id} • {formatDataVenda(venda.data_venda)}
                </span>
                <span className="shrink-0 text-sm font-bold text-green-600">{formatCurrency(Number(venda.total))}</span>
            </div>
            <p className="mt-1 truncate text-xs text-slate-500">{resumoItens(venda)}</p>
            <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2">
                <span className="truncate text-xs text-slate-500">{resumoPagamentos(venda) || 'Sem pagamento'}</span>
                <StatusBadge venda={venda} />
            </div>
        </>
    );
}

function acoesDoCard(venda: Venda, onOpen: Props['onOpen'], onCancelar: Props['onCancelar']): MobileCardAction[] {
    const acoes: MobileCardAction[] = [
        {
            key: 'abrir',
            label: venda.status === 'aberta' ? 'Editar' : 'Ver',
            icon: venda.status === 'aberta' ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
            onClick: () => onOpen(venda),
        },
    ];

    if (venda.status !== 'cancelada') {
        acoes.push({
            key: 'cancelar',
            label: 'Cancelar venda',
            icon: <Ban className="h-4 w-4" />,
            onClick: () => onCancelar(venda),
            destructive: true,
        });
    }

    return acoes;
}

export default function VendasTable({ loaded, items, meta, perPage, onPageChange, onPerPageChange, onOpen, onCancelar, onAdd }: Props) {
    const rows = items ?? [];
    const columns: Column<Venda>[] = [
        { key: 'id', label: '#', thClassName: 'w-16', render: (venda) => <span className="font-medium">#{venda.id}</span> },
        { key: 'data_venda', label: 'DATA', thClassName: 'w-24', render: (venda) => formatDataVenda(venda.data_venda) },
        {
            key: 'itens',
            label: 'ITENS',
            render: (venda) => <span className="line-clamp-2 max-w-[22rem]">{resumoItens(venda)}</span>,
        },
        {
            key: 'pagamentos',
            label: 'PAGAMENTO',
            thClassName: 'w-40',
            render: (venda) => <span className="truncate">{resumoPagamentos(venda) || '-'}</span>,
        },
        {
            key: 'total',
            label: 'TOTAL',
            thClassName: 'w-28 text-right',
            render: (venda) => <span className="font-medium text-green-600">{formatCurrency(Number(venda.total))}</span>,
        },
        {
            key: 'total_pago',
            label: 'PAGO',
            thClassName: 'w-28 text-right',
            render: (venda) => formatCurrency(Number(venda.total_pago)),
        },
        { key: 'status', label: 'STATUS', thClassName: 'w-24 text-center', render: (venda) => <StatusBadge venda={venda} /> },
        {
            key: 'acoes',
            label: 'AÇÃO',
            thClassName: 'w-16 text-center',
            render: (venda) => (
                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <AcoesVenda venda={venda} onOpen={onOpen} onCancelar={onCancelar} />
                </div>
            ),
        },
    ];

    return (
        <TableWithFilters
            columns={columns}
            data={rows}
            loaded={loaded}
            empty={<VendasEmpty onAdd={onAdd} />}
            mobile={
                <MobileCardList
                    items={rows}
                    getKey={(venda) => venda.id}
                    renderContent={(venda) => <VendaCardContent venda={venda} />}
                    onPress={onOpen}
                    actions={(venda) => acoesDoCard(venda, onOpen, onCancelar)}
                />
            }
            onRowClick={onOpen}
            pagination={{
                from: meta?.from ?? null,
                to: meta?.to ?? null,
                total: Number(meta?.total ?? 0),
                currentPage: Number(meta?.current_page ?? 1),
                lastPage: Number(meta?.last_page ?? 1),
                perPage,
                onPageChange,
                onPerPageChange,
                itemLabel: 'vendas',
            }}
        />
    );
}
