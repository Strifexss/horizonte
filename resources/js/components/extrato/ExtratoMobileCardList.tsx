import { Pencil, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type ExtratoItem = {
    id?: number | string;
    descricao?: string | null;
    data_competencia?: string | null;
    data_vencimento?: string | null;
    valor?: number | string | null;
    valor_pago?: number | string | null;
    categoria?: { nome?: string | null } | null;
    conta?: { nome?: string | null } | null;
    produto?: { nome?: string | null; grupo?: { nome?: string | null } | null } | null;
    funcionario?: { nome?: string | null } | null;
    financeiro?: { tipo?: string | null } | null;
};

const LONG_PRESS_MS = 1000;
const MOVE_TOLERANCE_PX = 10;

function formatDateISO(dateISO: string | null | undefined): string {
    if (!dateISO) {
        return '—';
    }

    try {
        const [year, month, day] = dateISO.split('-').map(Number);
        return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
    } catch {
        return dateISO;
    }
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function tipoDaParcela(p: ExtratoItem): string {
    return String(p.financeiro?.tipo ?? '').toUpperCase();
}

function statusDaParcela(p: ExtratoItem): 'aberto' | 'pago' | 'parcial' {
    const valor = Number(p.valor ?? 0);
    const valorPago = Number(p.valor_pago ?? 0);

    if (!valorPago || valorPago === 0) {
        return 'aberto';
    }

    if (valorPago >= valor) {
        return 'pago';
    }

    return 'parcial';
}

const STATUS_META = {
    aberto: {
        label: 'Aberto',
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    },
    pago: {
        label: 'Pago',
        className: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300',
    },
    parcial: {
        label: 'Parcial',
        className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    },
} as const;

type Props = {
    data: ExtratoItem[];
    onEdit: (item: ExtratoItem) => void;
    onDelete: (item: ExtratoItem) => void;
};

function cardKey(item: ExtratoItem, index: number): string {
    return String(item.id ?? index);
}

type CardProps = {
    item: ExtratoItem;
    expanded: boolean;
    onToggle: () => void;
    onEdit: (item: ExtratoItem) => void;
    onDelete: (item: ExtratoItem) => void;
};

function ExtratoMobileCard({ item, expanded, onToggle, onEdit, onDelete }: CardProps) {
    const [holding, setHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(false);
    const holdTimer = useRef<number | null>(null);
    const progressTimer = useRef<number | null>(null);
    const origin = useRef<{ x: number; y: number } | null>(null);
    const longPressFired = useRef(false);
    const suppressClick = useRef(false);

    const isReceita = tipoDaParcela(item) === 'RECEITA';
    const status = statusDaParcela(item);
    const statusMeta = STATUS_META[status];
    const isCategoriaProduto = String(item.categoria?.nome ?? '').toUpperCase() === 'PRODUTO';
    const produtoNome = item.produto?.nome;
    const grupoNome = item.produto?.grupo?.nome;
    const produtoLabel = produtoNome && grupoNome ? `${produtoNome} - ${grupoNome}` : produtoNome;
    const titulo = isCategoriaProduto && produtoLabel ? produtoLabel : item.descricao || 'Sem descrição';
    const metaParts = [formatDateISO(item.data_vencimento), item.conta?.nome, item.categoria?.nome].filter(Boolean);

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

    function onPointerDown(event: React.PointerEvent<HTMLButtonElement>): void {
        if (event.button !== 0) {
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

    function onPointerMove(event: React.PointerEvent<HTMLButtonElement>): void {
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
                    <span className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{titulo}</span>
                    <span className={`shrink-0 text-sm font-bold ${isReceita ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Number(item.valor ?? 0))}
                    </span>
                </div>
                <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-xs text-slate-500">
                        <span className="truncate">{metaParts.join(' • ')}</span>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusMeta.className}`}>
                        {statusMeta.label}
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
            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="flex border-t border-sidebar-border/70">
                        <button
                            type="button"
                            className="inline-flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-accent dark:text-slate-200"
                            onClick={() => onEdit(item)}
                        >
                            <Pencil className="h-4 w-4" />
                            Editar
                        </button>
                        <button
                            type="button"
                            className="inline-flex flex-1 items-center justify-center gap-2 border-l border-sidebar-border/70 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => onDelete(item)}
                        >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function ExtratoMobileCardList({ data, onEdit, onDelete }: Props) {
    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    return (
        <div className="flex flex-col gap-2 md:hidden">
            {data.map((item, index) => {
                const key = cardKey(item, index);

                return (
                    <ExtratoMobileCard
                        key={key}
                        item={item}
                        expanded={expandedKey === key}
                        onToggle={() => setExpandedKey((current) => (current === key ? null : key))}
                        onEdit={(current) => {
                            setExpandedKey(null);
                            onEdit(current);
                        }}
                        onDelete={(current) => {
                            setExpandedKey(null);
                            onDelete(current);
                        }}
                    />
                );
            })}
        </div>
    );
}
