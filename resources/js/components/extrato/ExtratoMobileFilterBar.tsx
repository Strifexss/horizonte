import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import ExtratoFilterFields, {
    type ExtratoFilterValues,
    type FilterOption,
} from '@/components/extrato/ExtratoFilterFields';
import { CalendarDays, ChevronLeft, ChevronRight, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const STATUS_LABELS: Record<string, string> = {
    aberto: 'Em Aberto',
    pago: 'Pago',
    parcial: 'Parcial',
};

function parseISODate(value: string): Date {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
}

function isoDate(date: Date): string {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function inicioMes(date: Date): string {
    return isoDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

function fimMes(date: Date): string {
    return isoDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function formatPeriodPill(dataInicio: string, dataFim: string): string {
    const start = parseISODate(dataInicio);
    const end = parseISODate(dataFim);
    const isFullMonth =
        dataInicio === inicioMes(start) && dataFim === fimMes(start) && start.getMonth() === end.getMonth();

    if (isFullMonth) {
        const mes = start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
        const label = mes.charAt(0).toUpperCase() + mes.slice(1);
        return `${label}/${start.getFullYear()}`;
    }

    return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
}

type Chip = {
    key: string;
    label: string;
};

type Props = {
    values: ExtratoFilterValues;
    onDraftChange: (patch: Partial<ExtratoFilterValues>) => void;
    onApply: (values?: ExtratoFilterValues) => void;
    onClearAll: () => void;
    onClearChip: (key: string) => void;
    loadContas: (q: string) => Promise<FilterOption[]>;
    loadCategorias: (q: string) => Promise<FilterOption[]>;
};

export default function ExtratoMobileFilterBar({
    values,
    onDraftChange,
    onApply,
    onClearAll,
    onClearChip,
    loadContas,
    loadCategorias,
}: Props) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [periodOpen, setPeriodOpen] = useState(false);
    const [draftInicio, setDraftInicio] = useState(values.dataInicio);
    const [draftFim, setDraftFim] = useState(values.dataFim);
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        if (periodOpen) {
            setDraftInicio(values.dataInicio);
            setDraftFim(values.dataFim);
        }
    }, [periodOpen, values.dataInicio, values.dataFim]);

    useEffect(() => {
        lastScrollY.current = window.scrollY;
        let ticking = false;

        const onScroll = () => {
            if (ticking) {
                return;
            }

            ticking = true;
            window.requestAnimationFrame(() => {
                const currentY = window.scrollY;
                const delta = currentY - lastScrollY.current;

                if (sheetOpen || periodOpen || currentY < 16) {
                    setVisible(true);
                } else if (delta > 6) {
                    setVisible(false);
                } else if (delta < -6) {
                    setVisible(true);
                }

                lastScrollY.current = currentY;
                ticking = false;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [sheetOpen, periodOpen]);

    const chips: Chip[] = useMemo(() => {
        const next: Chip[] = [];
        if (values.conta) {
            next.push({ key: 'conta', label: `Conta: ${values.conta.nome}` });
        }
        if (values.categoria) {
            next.push({ key: 'categoria', label: `Categoria: ${values.categoria.nome}` });
        }
        if (values.status && values.status !== 'todos') {
            next.push({ key: 'status', label: `Status: ${STATUS_LABELS[values.status] ?? values.status}` });
        }
        if (values.tipoData && values.tipoData !== 'vencimento') {
            next.push({ key: 'tipo_data', label: `Data: ${values.tipoData}` });
        }
        return next;
    }, [values]);

    const activeCount = chips.length;

    const shiftMonth = (delta: number) => {
        const base = parseISODate(values.dataInicio);
        const shifted = new Date(base.getFullYear(), base.getMonth() + delta, 1);
        const next = {
            ...values,
            dataInicio: inicioMes(shifted),
            dataFim: fimMes(shifted),
        };
        onDraftChange({ dataInicio: next.dataInicio, dataFim: next.dataFim });
        onApply(next);
    };

    return (
        <>
            <div
                className={`fixed inset-x-0 bottom-0 z-30 border-t border-sidebar-border/70 bg-background/95 px-3 py-2 pr-20 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-transform duration-300 ease-out supports-backdrop-filter:bg-background/90 md:hidden ${
                    visible ? 'translate-y-0' : 'translate-y-full'
                }`}
            >
                <div className="mx-auto mb-1 flex justify-center">
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/40"
                        onClick={() => setSheetOpen(true)}
                        aria-label="Expandir filtros"
                    >
                        <ChevronUp className="h-3.5 w-3.5" />
                        Expandir
                    </button>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                    <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-sidebar-border/70 bg-white dark:bg-slate-900">
                        <button
                            type="button"
                            className="rounded-l-full p-2 text-muted-foreground hover:bg-muted/40"
                            aria-label="Mês anterior"
                            onClick={() => shiftMonth(-1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className="inline-flex max-w-[7.5rem] items-center gap-1 px-1 py-1.5 text-xs font-medium"
                            onClick={() => setPeriodOpen(true)}
                        >
                            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                            <span className="truncate">{formatPeriodPill(values.dataInicio, values.dataFim)}</span>
                        </button>
                        <button
                            type="button"
                            className="rounded-r-full p-2 text-muted-foreground hover:bg-muted/40"
                            aria-label="Próximo mês"
                            onClick={() => shiftMonth(1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {chips.map((chip) => (
                            <button
                                key={chip.key}
                                type="button"
                                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sidebar-border/70 bg-white px-2.5 py-1 text-xs font-medium dark:bg-slate-900"
                                onClick={() => onClearChip(chip.key)}
                            >
                                <span className="max-w-[9rem] truncate">{chip.label}</span>
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1 rounded-full px-2.5"
                        onClick={() => setSheetOpen(true)}
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>Filtros</span>
                        {activeCount > 0 ? (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
                                {activeCount}
                            </span>
                        ) : null}
                    </Button>
                </div>
            </div>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent
                    side="bottom"
                    className="flex h-[85dvh] max-h-[85dvh] flex-col gap-0 rounded-t-2xl p-0 md:hidden"
                >
                    <SheetHeader className="shrink-0 border-b border-sidebar-border/70 px-4 py-4 text-left">
                        <SheetTitle>Filtros</SheetTitle>
                        <SheetDescription>Refine os lançamentos do extrato.</SheetDescription>
                    </SheetHeader>
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                        <ExtratoFilterFields
                            idPrefix="mobile-"
                            values={values}
                            onChange={onDraftChange}
                            loadContas={loadContas}
                            loadCategorias={loadCategorias}
                        />
                    </div>
                    <SheetFooter className="shrink-0 flex-row gap-2 border-t border-sidebar-border/70 bg-background px-4 py-3">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => {
                                onClearAll();
                                setSheetOpen(false);
                            }}
                        >
                            Limpar
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            className="flex-1"
                            onClick={() => {
                                onApply();
                                setSheetOpen(false);
                            }}
                        >
                            Aplicar Filtros
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <Sheet open={periodOpen} onOpenChange={setPeriodOpen}>
                <SheetContent
                    side="bottom"
                    className="flex max-h-[50dvh] flex-col gap-0 rounded-t-2xl p-0 md:hidden"
                >
                    <SheetHeader className="shrink-0 border-b border-sidebar-border/70 px-4 py-4 text-left">
                        <SheetTitle>Período</SheetTitle>
                        <SheetDescription>Escolha o intervalo de datas.</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-3 px-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="mobile-period-inicio">Início</Label>
                            <Input
                                id="mobile-period-inicio"
                                type="date"
                                value={draftInicio}
                                onChange={(e) => setDraftInicio(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mobile-period-fim">Fim</Label>
                            <Input
                                id="mobile-period-fim"
                                type="date"
                                value={draftFim}
                                onChange={(e) => setDraftFim(e.target.value)}
                            />
                        </div>
                    </div>
                    <SheetFooter className="flex-row gap-2 border-t border-sidebar-border/70 px-4 py-3">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setPeriodOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            className="flex-1"
                            onClick={() => {
                                const next = { ...values, dataInicio: draftInicio, dataFim: draftFim };
                                onDraftChange({ dataInicio: draftInicio, dataFim: draftFim });
                                onApply(next);
                                setPeriodOpen(false);
                            }}
                        >
                            Aplicar
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
