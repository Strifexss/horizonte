import type { ProdutoItem } from '@/components/produtos/types';
import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';

const LONG_PRESS_MS = 1000;
const MOVE_TOLERANCE_PX = 10;

function formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));
}

type Props = {
    item: ProdutoItem;
    expanded: boolean;
    onToggle: () => void;
    onEdit: (item: ProdutoItem) => void;
    onDelete: (item: ProdutoItem) => void;
};

export default function ProdutosCard({ item, expanded, onToggle, onEdit, onDelete }: Props) {
    const [holding, setHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(false);
    const holdTimer = useRef<number | null>(null);
    const progressTimer = useRef<number | null>(null);
    const origin = useRef<{ x: number; y: number } | null>(null);
    const longPressFired = useRef(false);
    const suppressClick = useRef(false);
    const canDelete = !item.em_uso;

    function clearTimers(): void {
        if (holdTimer.current !== null) {
            window.clearTimeout(holdTimer.current);
            holdTimer.current = null;
        }

        if (progressTimer.current !== null) {
            window.clearTimeout(progressTimer.current);
            progressTimer.current = null;
        }
    }

    function cancelHold(): void {
        clearTimers();
        origin.current = null;
        setHolding(false);
        setHoldProgress(false);
    }

    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, []);

    function onPointerDown(event: PointerEvent<HTMLButtonElement>): void {
        if (event.button !== 0 || !canDelete) {
            return;
        }

        cancelHold();
        longPressFired.current = false;
        origin.current = { x: event.clientX, y: event.clientY };
        setHolding(true);
        progressTimer.current = window.setTimeout(() => setHoldProgress(true), 16);
        holdTimer.current = window.setTimeout(() => {
            holdTimer.current = null;
            longPressFired.current = true;
            origin.current = null;
            setHolding(false);
            setHoldProgress(false);
            onToggle();
        }, LONG_PRESS_MS);
    }

    function onPointerMove(event: PointerEvent<HTMLButtonElement>): void {
        if (!origin.current || holdTimer.current === null) {
            return;
        }

        const dx = Math.abs(event.clientX - origin.current.x);
        const dy = Math.abs(event.clientY - origin.current.y);

        if (dx > MOVE_TOLERANCE_PX || dy > MOVE_TOLERANCE_PX) {
            cancelHold();
        }
    }

    function onPointerUp(): void {
        if (longPressFired.current) {
            suppressClick.current = true;
            longPressFired.current = false;
            window.setTimeout(() => {
                suppressClick.current = false;
            }, 400);
        }

        cancelHold();
    }

    return (
        <article className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:bg-slate-900">
            <button
                type="button"
                className="relative w-full p-3 text-left transition-colors select-none active:bg-slate-50 dark:active:bg-slate-800"
                style={{ WebkitTouchCallout: 'none' }}
                aria-expanded={expanded}
                onContextMenu={(event) => event.preventDefault()}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={cancelHold}
                onPointerLeave={cancelHold}
                onClick={() => {
                    if (suppressClick.current) {
                        suppressClick.current = false;
                        return;
                    }

                    onEdit(item);
                }}
            >
                <div className="flex min-w-0 items-start justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.nome}</span>
                    <span className="shrink-0 text-sm font-bold text-slate-800 dark:text-slate-100">
                        {formatCurrency(item.preco_venda)}
                    </span>
                </div>
                <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-xs text-slate-500">
                        Compra {formatCurrency(item.preco_compra)}
                    </span>
                    <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            item.ativo
                                ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                                : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        {item.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
                {holding ? (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-amber-100 dark:bg-amber-950/60">
                        <span
                            className={`block h-full bg-amber-500 ${holdProgress ? 'w-full' : 'w-0'} transition-[width] duration-1000 ease-linear`}
                        />
                    </span>
                ) : null}
            </button>
            {canDelete ? (
                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="flex border-t border-sidebar-border/70">
                            <button
                                type="button"
                                className="inline-flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => onDelete(item)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </article>
    );
}
