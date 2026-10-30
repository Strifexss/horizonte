import { TableWithFilters, type Column } from '@/components/padrões';
import { formatarData } from './formatarData';
import SeloMetodoLogin from './SeloMetodoLogin';
import type { Usuario } from './types';
import UsuariosAcoes from './UsuariosAcoes';

type Props = {
    usuarios: Usuario[];
    onEditar: (usuario: Usuario) => void;
    onEntrarComo: (usuario: Usuario) => void;
    onExcluir: (usuario: Usuario) => void;
};

export default function UsuariosTable({ usuarios, onEditar, onEntrarComo, onExcluir }: Props) {
    const columns: Column<Usuario>[] = [
        { key: 'name', label: 'Nome', className: 'truncate font-medium' },
        {
            key: 'email',
            label: 'E-mail',
            render: (usuario) => (
                <span className="flex min-w-0 items-center gap-2">
                    <SeloMetodoLogin contaGoogle={usuario.conta_google} />
                    <span className="truncate">{usuario.email}</span>
                </span>
            ),
        },
        { key: 'empresa', label: 'Empresa', className: 'truncate', render: (usuario) => usuario.empresa ?? '—' },
        {
            key: 'created_at',
            label: 'Cadastro',
            thClassName: 'w-32',
            render: (usuario) => formatarData(usuario.created_at),
        },
        {
            key: 'acoes',
            label: '',
            thClassName: 'w-16',
            className: 'text-right',
            render: (usuario) => <UsuariosAcoes usuario={usuario} onEditar={onEditar} onEntrarComo={onEntrarComo} onExcluir={onExcluir} />,
        },
    ];

    return <TableWithFilters columns={columns} data={usuarios} fixedLayout />;
}
