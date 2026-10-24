import type { ExtratoStatusTab } from '@/components/extrato/types';
import { SearchInput, StatusChips, type StatusChip } from '@/components/padrões';

export type { ExtratoStatusTab };

type Counts = Record<ExtratoStatusTab, number>;

type Props = {
    busca: string;
    onBuscaChange: (value: string) => void;
    status: ExtratoStatusTab;
    onStatusChange: (status: ExtratoStatusTab) => void;
    counts: Counts;
};

const TABS: StatusChip<ExtratoStatusTab>[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'aberto', label: 'Aberto' },
    { id: 'pago', label: 'Pago' },
    { id: 'parcial', label: 'Parcial' },
];

export default function ExtratoTableToolbar({ busca, onBuscaChange, status, onStatusChange, counts }: Props) {
    return (
        <div className="flex min-w-0 flex-col gap-3">
            <SearchInput value={busca} onChange={onBuscaChange} placeholder="Buscar lançamento..." />

            <StatusChips chips={TABS} value={status} onChange={onStatusChange} counts={counts} />
        </div>
    );
}
