import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ExtratoStatusTab = 'todos' | 'aberto' | 'pago' | 'parcial';

type Counts = Record<ExtratoStatusTab, number>;

type Props = {
    busca: string;
    onBuscaChange: (value: string) => void;
    status: ExtratoStatusTab;
    onStatusChange: (status: ExtratoStatusTab) => void;
    counts: Counts;
};

const TABS: { id: ExtratoStatusTab; label: string }[] = [
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
                    className="h-10 w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
                />
            </div>

            <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max items-center gap-1.5 pb-0.5">
                    {TABS.map((tab) => {
                        const active = status === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                aria-pressed={active}
                                onClick={() => onStatusChange(tab.id)}
                                className={cn(
                                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                                    active
                                        ? 'border-amber-500 bg-amber-500 text-white'
                                        : 'border-input bg-white text-foreground hover:bg-slate-50 dark:bg-slate-900',
                                )}
                            >
                                {tab.label}
                                <span
                                    className={cn(
                                        'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium',
                                        active
                                            ? 'bg-amber-400 text-white'
                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                                    )}
                                >
                                    {counts[tab.id]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
