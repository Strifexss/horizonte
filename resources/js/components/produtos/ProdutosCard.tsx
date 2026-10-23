import type { ProdutoItem } from '@/components/produtos/types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

function formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));
}

type Props = {
    item: ProdutoItem;
    onEdit: (item: ProdutoItem) => void;
    onDelete: (item: ProdutoItem) => void;
    onInativar: (item: ProdutoItem) => void;
};

export default function ProdutosCard({ item, onEdit, onDelete, onInativar }: Props) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="truncate font-medium">{item.nome}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                        Compra {formatCurrency(item.preco_compra)} · Venda {formatCurrency(item.preco_venda)}
                    </div>
                </div>
                <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                        item.ativo
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                            : 'bg-muted text-muted-foreground'
                    }`}
                >
                    {item.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </div>
            <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="icon" aria-label="Editar produto" onClick={() => onEdit(item)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                {item.em_uso ? (
                    item.ativo ? (
                        <Button variant="ghost" size="sm" onClick={() => onInativar(item)}>
                            Inativar
                        </Button>
                    ) : null
                ) : (
                    <Button variant="ghost" size="icon" aria-label="Excluir produto" onClick={() => onDelete(item)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                )}
            </div>
        </div>
    );
}
