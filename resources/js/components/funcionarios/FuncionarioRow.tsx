import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash, User } from 'lucide-react';

type Funcionario = {
    id: number | string;
    nome: string;
    salario: number | string;
};

function formatCurrency(value: number | string) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));
}

export default function FuncionarioRow({
    funcionario,
    onEdit,
    onDelete,
}: {
    funcionario: Funcionario;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-md border border-muted/20 p-3">
            <div className="flex items-center gap-3 min-w-0">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0">
                    <div className="font-medium truncate">{funcionario.nome}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(funcionario.salario)}</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar funcionário">
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir funcionário">
                    <Trash className="h-4 w-4 text-red-600" />
                </Button>
            </div>
        </div>
    );
}
