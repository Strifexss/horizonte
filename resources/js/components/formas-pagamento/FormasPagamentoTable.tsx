import FormasPagamentoCard, { Selo } from '@/components/formas-pagamento/FormasPagamentoCard';
import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import { MobileCardList, TableWithFilters, type Column } from '@/components/padrões';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Lock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

type Props = {
    loaded: boolean;
    items: FormaPagamentoItem[];
    onEdit: (item: FormaPagamentoItem) => void;
    onDelete: (item: FormaPagamentoItem) => void;
};

export default function FormasPagamentoTable({ loaded, items, onEdit, onDelete }: Props) {
    const columns: Column<FormaPagamentoItem>[] = [
        {
            key: 'nome',
            label: 'NOME',
            render: (item) => <span className="font-medium">{item.nome}</span>,
        },
        {
            key: 'padrao',
            label: 'TIPO',
            thClassName: 'w-32',
            render: (item) => (item.padrao ? <Selo tom="ambar">Padrão</Selo> : <Selo tom="neutro">Própria</Selo>),
        },
        {
            key: 'baixa_automatica',
            label: 'BAIXA',
            thClassName: 'w-40',
            render: (item) => <Selo tom={item.baixa_automatica ? 'verde' : 'neutro'}>{item.baixa_automatica ? 'Automática' : 'Manual'}</Selo>,
        },
        {
            key: 'ativo',
            label: 'STATUS',
            thClassName: 'w-28',
            render: (item) => <Selo tom={item.ativo ? 'verde' : 'neutro'}>{item.ativo ? 'Ativa' : 'Inativa'}</Selo>,
        },
        {
            key: 'acoes',
            label: 'AÇÃO',
            thClassName: 'w-20 text-center',
            render: (item) =>
                item.padrao ? (
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs" title="Formas padrão não podem ser alteradas">
                        <Lock className="h-3.5 w-3.5" />
                        Sistema
                    </span>
                ) : (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    aria-label={`Ações de ${item.nome}`}
                                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md p-1"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => onEdit(item)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onDelete(item)}>
                                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                    Excluir
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
        },
    ];

    return (
        <TableWithFilters
            columns={columns}
            data={items}
            loaded={loaded}
            mobile={
                <MobileCardList
                    items={items}
                    getKey={(item) => item.id}
                    renderContent={(item) => <FormasPagamentoCard item={item} />}
                    onPress={(item) => {
                        if (!item.padrao) {
                            onEdit(item);
                        }
                    }}
                    actions={(item) =>
                        item.padrao
                            ? []
                            : [
                                  { key: 'editar', label: 'Editar', icon: <Pencil className="h-4 w-4" />, onClick: () => onEdit(item) },
                                  {
                                      key: 'excluir',
                                      label: 'Excluir',
                                      icon: <Trash2 className="h-4 w-4" />,
                                      onClick: () => onDelete(item),
                                      destructive: true,
                                  },
                              ]
                    }
                />
            }
        />
    );
}
