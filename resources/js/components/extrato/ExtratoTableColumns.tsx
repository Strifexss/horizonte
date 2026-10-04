import { formatCurrency, formatDateISO, parcelaEhReceita, statusDaParcela } from '@/components/extrato/format';
import type { ExtratoParcela } from '@/components/extrato/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowDownRight, ArrowUpRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

export type ExtratoTableColumn = {
    key: string;
    label: string;
    thClassName?: string;
    render: (p: ExtratoParcela) => ReactNode;
};

type ExtratoTableColumnsProps = {
    onEdit: (parcela: ExtratoParcela) => void;
    onDelete: (parcela: ExtratoParcela) => void;
};

export function extratoTableColumns({ onEdit, onDelete }: ExtratoTableColumnsProps): ExtratoTableColumn[] {
    return [
        {
            key: 'data',
            label: 'DATA',
            thClassName: 'w-24',
            render: (p) => formatDateISO(p.data_competencia),
        },
        {
            key: 'descricao',
            label: 'DESCRIÇÃO',
            thClassName: 'w-48',
            render: (p) => {
                const isReceita = parcelaEhReceita(p);

                return (
                    <div className="flex max-w-[10rem] items-center gap-2">
                        <span
                            className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isReceita ? 'bg-green-50 text-green-600 dark:bg-green-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}
                        >
                            {isReceita ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </span>
                        <span className="text-dark truncate font-medium">{p.descricao}</span>
                    </div>
                );
            },
        },
        {
            key: 'produto',
            label: 'PRODUTO',
            thClassName: 'w-36',
            render: (p) => {
                const nome = p.produto?.nome;
                if (!nome) {
                    return '';
                }
                const grupo = p.produto?.grupo?.nome;
                const label = grupo ? `${nome} - ${grupo}` : nome;

                return <span className="truncate">{label}</span>;
            },
        },
        {
            key: 'quantidade',
            label: 'QTD',
            thClassName: 'w-16 text-center',
            render: (p) => {
                const isProduto = p.categoria?.nome?.toUpperCase() === 'PRODUTO' || p.produto_id != null;

                return isProduto ? (
                    <span className="text-center">{p.quantidade ?? '-'}</span>
                ) : (
                    <span className="text-muted-foreground text-center">-</span>
                );
            },
        },
        {
            key: 'fornecedor',
            label: 'FORNECEDOR',
            thClassName: 'w-36',
            render: (p) => {
                const nome = p.produto?.fornecedor?.nome ?? p.fornecedor?.nome ?? null;

                return nome ? <span className="truncate">{nome}</span> : '';
            },
        },
        {
            key: 'categoria',
            label: 'CATEGORIA',
            thClassName: 'w-36',
            render: (p) => {
                const nome = p.categoria?.nome;
                const isReceita = parcelaEhReceita(p);

                return nome ? (
                    <span
                        className={`inline-block max-w-full truncate rounded px-1.5 py-0.5 text-xs font-medium ${isReceita ? 'bg-green-50 text-green-700 dark:bg-green-900/30' : 'bg-red-50 text-red-700 dark:bg-red-900/30'}`}
                    >
                        {nome}
                    </span>
                ) : (
                    ''
                );
            },
        },
        {
            key: 'conta',
            label: 'CONTA',
            thClassName: 'w-24',
            render: (p) => <span className="truncate">{p.conta?.nome ?? ''}</span>,
        },
        {
            key: 'valor',
            label: 'VALOR',
            thClassName: 'w-28 text-right',
            render: (p) => (
                <div className={`text-right ${parcelaEhReceita(p) ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(Number(p.valor ?? 0))}</div>
            ),
        },
        {
            key: 'valor_pago',
            label: 'PAGO',
            thClassName: 'w-28 text-right',
            render: (p) => (
                <div className={`text-right ${parcelaEhReceita(p) ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Number(p.valor_pago ?? 0))}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'STATUS',
            thClassName: 'w-20 text-center',
            render: (p) => {
                const status = statusDaParcela(p);
                const labels = { aberto: 'ABERTO', pago: 'PAGO', parcial: 'PARCIAL' } as const;
                const colorClass = {
                    aberto: 'bg-primary/10 text-primary',
                    pago: 'bg-green-50 text-green-700 dark:bg-green-900/30',
                    parcial: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30',
                }[status];

                return <span className={`inline-block rounded px-1 py-0.5 text-xs font-medium ${colorClass}`}>{labels[status]}</span>;
            },
        },
        {
            key: 'acoes',
            label: 'AÇÃO',
            thClassName: 'w-16 text-center',
            render: (p) => (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md p-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => onEdit(p)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onDelete(p)}>
                                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];
}
