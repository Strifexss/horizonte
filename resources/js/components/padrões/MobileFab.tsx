import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

export type MobileFabAction = {
    key: string;
    label: string;
    icon: ReactNode;
    onClick: () => void;
    /** Cores do botão; o padrão é branco com borda. */
    className?: string;
};

type Props = {
    actions: MobileFabAction[];
};

/** Bolha "+" fixa acima da barra de filtros do mobile; abre a pilha de ações rápidas da tela. */
export default function MobileFab({ actions }: Props) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <div className="pointer-events-none fixed right-4 bottom-24 z-40 md:hidden">
            {open ? (
                <button
                    type="button"
                    aria-label="Fechar menu de ações"
                    className="pointer-events-auto fixed inset-0 z-40 bg-black/30"
                    onClick={() => setOpen(false)}
                />
            ) : null}

            <div className="pointer-events-auto relative z-50 flex flex-col items-end gap-3">
                {open ? (
                    <div className="mb-1 flex flex-col items-end gap-2">
                        {actions.map((action) => (
                            <button
                                key={action.key}
                                type="button"
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow-lg',
                                    action.className ?? 'border-sidebar-border/70 text-muted-foreground border bg-white',
                                )}
                                onClick={() => {
                                    setOpen(false);
                                    action.onClick();
                                }}
                            >
                                {action.icon}
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                ) : null}

                <button
                    type="button"
                    aria-expanded={open}
                    aria-label={open ? 'Fechar ações rápidas' : 'Abrir ações rápidas'}
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-transform hover:bg-blue-700 ${open ? 'rotate-45' : ''}`}
                    onClick={() => setOpen((v) => !v)}
                >
                    <Plus className="h-7 w-7" />
                </button>
            </div>
        </div>
    );
}
