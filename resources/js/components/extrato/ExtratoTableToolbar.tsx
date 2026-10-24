import type { ExtratoStatusTab } from '@/components/extrato/types';
import { StatusChips, type StatusChip } from '@/components/padrões';
import { Search } from 'lucide-react';

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
            <div className="relative w-full min-w-0">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#aaaaaa]">
                    <Search className="h-4 w-4" aria-hidden="true" />
                </span>
                <input
                    type="text"
                    name="search"
                    value={busca}
                    onChange={(e) => onBuscaChange(e.target.value)}
                    placeholder="Buscar lançamento..."
                    className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border py-2 pr-3 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                />
            </div>

            <StatusChips chips={TABS} value={status} onChange={onStatusChange} counts={counts} />
        </div>
    );
}
