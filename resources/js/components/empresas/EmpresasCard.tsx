import SeloModulos from '@/components/segmentos/SeloModulos';
import type { ModuloOpcional } from '@/components/segmentos/types';
import SeloMetodoLogin from '@/components/usuarios/SeloMetodoLogin';
import EmpresasAcoes from './EmpresasAcoes';
import type { EmpresaAdmin } from './types';

type Props = {
    empresa: EmpresaAdmin;
    catalogo: ModuloOpcional[];
    onAjustar: (empresa: EmpresaAdmin) => void;
    onEntrarComo: (empresa: EmpresaAdmin) => void;
};

export default function EmpresasCard({ empresa, catalogo, onAjustar, onEntrarComo }: Props) {
    return (
        <div className="border-sidebar-border/70 flex items-start justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="flex min-w-0 flex-col gap-1.5">
                <p className="truncate font-medium">{empresa.nome}</p>
                {empresa.admin_master ? (
                    <p className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm">
                        <SeloMetodoLogin contaGoogle={empresa.admin_master.conta_google} />
                        <span className="truncate">{empresa.admin_master.email}</span>
                    </p>
                ) : null}
                <p className="text-muted-foreground text-xs">Segmento: {empresa.segmento ?? '—'}</p>
                <SeloModulos modulos={empresa.modulos} catalogo={catalogo} />
            </div>
            <EmpresasAcoes empresa={empresa} onAjustar={onAjustar} onEntrarComo={onEntrarComo} />
        </div>
    );
}
