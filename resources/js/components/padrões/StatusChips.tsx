import { cn } from '@/lib/utils';

export type StatusChip<T extends string> = {
    id: T;
    label: string;
};

type Props<T extends string> = {
    chips: StatusChip<T>[];
    value: T;
    onChange: (value: T) => void;
    counts: Record<T, number>;
};

/** Chips de status com contagem, roláveis na horizontal no mobile. */
export default function StatusChips<T extends string>({ chips, value, onChange, counts }: Props<T>) {
    return (
        <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max items-center gap-1.5 pb-0.5">
                {chips.map((chip) => {
                    const active = value === chip.id;

                    return (
                        <button
                            key={chip.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => onChange(chip.id)}
                            className={cn(
                                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                                active
                                    ? 'border-amber-500 bg-amber-500 text-white'
                                    : 'border-input text-foreground bg-white hover:bg-slate-50 dark:bg-slate-900',
                            )}
                        >
                            {chip.label}
                            <span
                                className={cn(
                                    'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium',
                                    active ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                                )}
                            >
                                {counts[chip.id]}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
