import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogIn, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Usuario } from './types';

type Props = {
    usuario: Usuario;
    onEditar: (usuario: Usuario) => void;
    onEntrarComo: (usuario: Usuario) => void;
    onExcluir: (usuario: Usuario) => void;
};

export default function UsuariosAcoes({ usuario, onEditar, onEntrarComo, onExcluir }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Ações de {usuario.name}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEditar(usuario)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEntrarComo(usuario)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar como
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onExcluir(usuario)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
