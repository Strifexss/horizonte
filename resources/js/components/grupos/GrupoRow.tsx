import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Layers, Trash } from 'lucide-react';

type Grupo = {
    id: number | string;
    nome: string;
};

export default function GrupoRow({
    grupo,
    onEdit,
    onDelete,
}: {
    grupo: Grupo;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-md border border-muted/20 p-3">
            <div className="flex items-center gap-3 min-w-0">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0">
                    <div className="font-medium truncate">{grupo.nome}</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar grupo">
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir grupo">
                    <Trash className="h-4 w-4 text-red-600" />
                </Button>
            </div>
        </div>
    );
}
