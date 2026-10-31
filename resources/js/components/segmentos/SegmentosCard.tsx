import SegmentosAcoes from './SegmentosAcoes';
import SeloAtivo from './SeloAtivo';
import SeloModulos from './SeloModulos';
import type { ModuloOpcional, Segmento } from './types';

type Props = {
    segmento: Segmento;
    catalogo: ModuloOpcional[];
    onEditar: (segmento: Segmento) => void;
    onExcluir: (segmento: Segmento) => void;
};

export default function SegmentosCard({ segmento, catalogo, onEditar, onExcluir }: Props) {
    return (
        <div className="border-sidebar-border/70 flex items-start justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="flex min-w-0 flex-col gap-2">
                <p className="flex items-center gap-2">
                    <span className="truncate font-medium">{segmento.nome}</span>
                    <SeloAtivo ativo={segmento.ativo} />
                </p>
                {segmento.descricao ? <p className="text-muted-foreground text-sm">{segmento.descricao}</p> : null}
                <SeloModulos modulos={segmento.modulos} catalogo={catalogo} />
                <p className="text-muted-foreground text-xs">{segmento.empresas_count ?? 0} empresas</p>
            </div>
            <SegmentosAcoes segmento={segmento} onEditar={onEditar} onExcluir={onExcluir} />
        </div>
    );
}
