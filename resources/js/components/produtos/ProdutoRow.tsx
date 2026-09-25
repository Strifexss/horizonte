import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Package } from 'lucide-react';

type Produto = {
    id: number | string;
    nome: string;
    preco_compra: number | string;
};

function formatCurrency(value: number | string) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));
}

export default function ProdutoRow({
    produto,
    onEdit,
    onDelete,
}: {
    produto: Produto;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-md border border-muted/20 p-3">
            <div className="flex items-center gap-3 min-w-0">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0">
                    <div className="font-medium truncate">{produto.nome}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(produto.preco_compra)}</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar produto">
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir produto">
                    <Trash className="h-4 w-4 text-red-600" />
                </Button>
            </div>
        </div>
    );
}
