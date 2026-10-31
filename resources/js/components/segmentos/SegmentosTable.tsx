import { TableWithFilters, type Column } from '@/components/padrões';
import SegmentosAcoes from './SegmentosAcoes';
import SeloAtivo from './SeloAtivo';
import SeloModulos from './SeloModulos';
import type { ModuloOpcional, Segmento } from './types';

type Props = {
    segmentos: Segmento[];
    catalogo: ModuloOpcional[];
    onEditar: (segmento: Segmento) => void;
    onExcluir: (segmento: Segmento) => void;
};

export default function SegmentosTable({ segmentos, catalogo, onEditar, onExcluir }: Props) {
    const columns: Column<Segmento>[] = [
        {
            key: 'nome',
            label: 'Segmento',
            render: (segmento) => (
                <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{segmento.nome}</span>
                    {segmento.descricao ? <span className="text-muted-foreground truncate text-xs">{segmento.descricao}</span> : null}
                </span>
            ),
        },
        { key: 'modulos', label: 'Módulos opcionais', render: (segmento) => <SeloModulos modulos={segmento.modulos} catalogo={catalogo} /> },
        { key: 'empresas_count', label: 'Empresas', thClassName: 'w-24', render: (segmento) => segmento.empresas_count ?? 0 },
        { key: 'ativo', label: 'Status', thClassName: 'w-24', render: (segmento) => <SeloAtivo ativo={segmento.ativo} /> },
        {
            key: 'acoes',
            label: '',
            thClassName: 'w-16',
            className: 'text-right',
            render: (segmento) => <SegmentosAcoes segmento={segmento} onEditar={onEditar} onExcluir={onExcluir} />,
        },
    ];

    return <TableWithFilters columns={columns} data={segmentos} fixedLayout />;
}
