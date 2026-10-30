import { formatarData } from './formatarData';
import SeloMetodoLogin from './SeloMetodoLogin';
import type { Usuario } from './types';
import UsuariosAcoes from './UsuariosAcoes';

type Props = {
    usuario: Usuario;
    onEditar: (usuario: Usuario) => void;
    onEntrarComo: (usuario: Usuario) => void;
    onExcluir: (usuario: Usuario) => void;
};

export default function UsuariosCard({ usuario, onEditar, onEntrarComo, onExcluir }: Props) {
    return (
        <div className="border-sidebar-border/70 flex items-start justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="min-w-0">
                <p className="truncate font-medium">{usuario.name}</p>
                <p className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm">
                    <SeloMetodoLogin contaGoogle={usuario.conta_google} />
                    <span className="truncate">{usuario.email}</span>
                </p>
                <p className="text-muted-foreground truncate text-sm">{usuario.empresa ?? 'Sem empresa'}</p>
                <p className="text-muted-foreground mt-1 text-xs">Cadastro: {formatarData(usuario.created_at)}</p>
            </div>
            <UsuariosAcoes usuario={usuario} onEditar={onEditar} onEntrarComo={onEntrarComo} onExcluir={onExcluir} />
        </div>
    );
}
