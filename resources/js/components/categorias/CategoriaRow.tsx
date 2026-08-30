import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Edit, Trash, Tag } from 'lucide-react';

type Categoria = {
    id: number | string;
    nome: string;
    tipo: 'receita' | 'despesa';
    padrao?: number | null;
};

export default function CategoriaRow({
    categoria,
    onEdit,
    onDelete,
}: {
    categoria: Categoria;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-md border border-muted/20 p-3">
            <div className="flex items-center gap-3 min-w-0">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0">
                    <div className="font-medium truncate">{categoria.nome}</div>
                    <div className="text-xs text-muted-foreground">{categoria.tipo === 'receita' ? 'Receita' : 'Despesa'}</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar categoria">
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir categoria">
                    <Trash className="h-4 w-4 text-red-600" />
                </Button>
            </div>
        </div>
    );
}

