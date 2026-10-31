import { TableWithFilters, type Column } from '@/components/padrões';
import SeloModulos from '@/components/segmentos/SeloModulos';
import type { ModuloOpcional } from '@/components/segmentos/types';
import SeloMetodoLogin from '@/components/usuarios/SeloMetodoLogin';
import EmpresasAcoes from './EmpresasAcoes';
import type { EmpresaAdmin } from './types';

type Props = {
    empresas: EmpresaAdmin[];
    catalogo: ModuloOpcional[];
    onAjustar: (empresa: EmpresaAdmin) => void;
    onEntrarComo: (empresa: EmpresaAdmin) => void;
};

export default function EmpresasTable({ empresas, catalogo, onAjustar, onEntrarComo }: Props) {
    const columns: Column<EmpresaAdmin>[] = [
        { key: 'nome', label: 'Empresa', className: 'truncate font-medium' },
        {
            key: 'admin_master',
            label: 'Admin master',
            render: (empresa) =>
                empresa.admin_master ? (
                    <span className="flex min-w-0 items-center gap-2">
                        <SeloMetodoLogin contaGoogle={empresa.admin_master.conta_google} />
                        <span className="truncate">{empresa.admin_master.email}</span>
                    </span>
                ) : (
                    '—'
                ),
        },
        { key: 'segmento', label: 'Segmento', thClassName: 'w-36', className: 'truncate', render: (empresa) => empresa.segmento ?? '—' },
        { key: 'modulos', label: 'Módulos opcionais', render: (empresa) => <SeloModulos modulos={empresa.modulos} catalogo={catalogo} /> },
        {
            key: 'acoes',
            label: '',
            thClassName: 'w-16',
            className: 'text-right',
            render: (empresa) => <EmpresasAcoes empresa={empresa} onAjustar={onAjustar} onEntrarComo={onEntrarComo} />,
        },
    ];

    return <TableWithFilters columns={columns} data={empresas} fixedLayout />;
}
