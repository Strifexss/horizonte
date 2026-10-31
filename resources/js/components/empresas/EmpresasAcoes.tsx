import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogIn, MoreHorizontal, SlidersHorizontal } from 'lucide-react';
import type { EmpresaAdmin } from './types';

type Props = {
    empresa: EmpresaAdmin;
    onAjustar: (empresa: EmpresaAdmin) => void;
    onEntrarComo: (empresa: EmpresaAdmin) => void;
};

export default function EmpresasAcoes({ empresa, onAjustar, onEntrarComo }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Ações de {empresa.nome}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onAjustar(empresa)}>
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Segmento e módulos
                </DropdownMenuItem>
                {empresa.urls.entrar_como ? (
                    <DropdownMenuItem onSelect={() => onEntrarComo(empresa)}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar como
                    </DropdownMenuItem>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
