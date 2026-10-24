import FiltroPeriodoDatas from '@/components/padrões/FiltroPeriodoDatas';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CalendarDays, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react';

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
    const isFullMonth = dataInicio === inicioMes(start) && dataFim === fimMes(start) && start.getMonth() === end.getMonth();

    if (isFullMonth) {
        const mes = start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
        const label = mes.charAt(0).toUpperCase() + mes.slice(1);
        return `${label}/${start.getFullYear()}`;
    }

    return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
}

type Props = {
    dataInicio: string;
    dataFim: string;
    /** Chamado pelas setas de mês e pela folha de período; a tela aplica a busca na hora. */
    onPeriodApply: (dataInicio: string, dataFim: string) => void;
    /** Filtros escolhidos na folha, sem contar o período. */
    activeCount: number;
    onApply: () => void;
    onClearAll: () => void;
    sheetDescription: string;
    /** Campos da folha de filtros (os mesmos do card de filtros do desktop). */
    children: ReactNode;
};

/** Barra fixa no rodapé do mobile: período com setas de mês e botão que abre a folha de filtros. Some ao rolar para baixo. */
export default function MobileFilterDock({
    dataInicio,
    dataFim,
    onPeriodApply,
    activeCount,
    onApply,
    onClearAll,
    sheetDescription,
    children,
}: Props) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [periodOpen, setPeriodOpen] = useState(false);
    const [draftInicio, setDraftInicio] = useState(dataInicio);
    const [draftFim, setDraftFim] = useState(dataFim);
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);
    const touchStartY = useRef<number | null>(null);

    useEffect(() => {
        if (periodOpen) {
            setDraftInicio(dataInicio);
            setDraftFim(dataFim);
        }
    }, [periodOpen, dataInicio, dataFim]);

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

    const shiftMonth = (delta: number) => {
        const base = parseISODate(dataInicio);
        const shifted = new Date(base.getFullYear(), base.getMonth() + delta, 1);
        onPeriodApply(inicioMes(shifted), fimMes(shifted));
    };

    const onDockTouchStart = (e: TouchEvent) => {
        touchStartY.current = e.touches[0]?.clientY ?? null;
    };

    const onDockTouchEnd = (e: TouchEvent) => {
        if (touchStartY.current === null) {
            return;
        }

        const endY = e.changedTouches[0]?.clientY;
        if (endY === undefined) {
            touchStartY.current = null;
            return;
        }

        const swipeUpDistance = touchStartY.current - endY;
        if (swipeUpDistance > 48) {
            setSheetOpen(true);
        }

        touchStartY.current = null;
    };

    return (
        <>
            <div
                className={`fixed inset-x-3 bottom-3 z-30 md:hidden ${
                    visible ? 'translate-y-0' : 'translate-y-[calc(100%+1.25rem)]'
                } transition-transform duration-300 ease-out`}
            >
                <div
                    className="rounded-2xl border border-white/40 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/95"
                    onTouchStart={onDockTouchStart}
                    onTouchEnd={onDockTouchEnd}
                >
                    <button
                        type="button"
                        className="mx-auto mb-2 flex w-full flex-col items-center py-1"
                        aria-label="Abrir filtros"
                        onClick={() => setSheetOpen(true)}
                    >
                        <span className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
                    </button>

                    <div className="grid min-w-0 grid-cols-2 gap-2">
                        <div className="flex h-9 min-w-0 items-center justify-between rounded-full border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-800">
                            <button
                                type="button"
                                className="text-muted-foreground hover:bg-muted/40 rounded-l-full p-2"
                                aria-label="Mês anterior"
                                onClick={() => shiftMonth(-1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                className="inline-flex min-w-0 items-center justify-center gap-1 px-1 py-1.5 text-xs font-medium"
                                onClick={() => setPeriodOpen(true)}
                            >
                                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                <span className="truncate">{formatPeriodPill(dataInicio, dataFim)}</span>
                            </button>
                            <button
                                type="button"
                                className="text-muted-foreground hover:bg-muted/40 rounded-r-full p-2"
                                aria-label="Próximo mês"
                                onClick={() => shiftMonth(1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 w-full justify-center gap-1 rounded-full border-slate-200/80 bg-white px-2.5 dark:border-slate-700 dark:bg-slate-800"
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
            </div>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="bottom" className="flex h-[85dvh] max-h-[85dvh] flex-col gap-0 rounded-t-2xl p-0 md:hidden">
                    <SheetHeader className="border-sidebar-border/70 shrink-0 border-b px-4 py-4 text-left">
                        <SheetTitle>Filtros</SheetTitle>
                        <SheetDescription>{sheetDescription}</SheetDescription>
                    </SheetHeader>
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
                    <SheetFooter className="border-sidebar-border/70 bg-background shrink-0 flex-row gap-2 border-t px-4 py-3">
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
                <SheetContent side="bottom" className="flex max-h-[50dvh] flex-col gap-0 rounded-t-2xl p-0 md:hidden">
                    <SheetHeader className="border-sidebar-border/70 shrink-0 border-b px-4 py-4 text-left">
                        <SheetTitle>Período</SheetTitle>
                        <SheetDescription>Escolha o intervalo de datas.</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-3 px-4 py-4">
                        <FiltroPeriodoDatas
                            dataInicio={draftInicio}
                            dataFim={draftFim}
                            onInicioChange={setDraftInicio}
                            onFimChange={setDraftFim}
                            idPrefix="mobile-period-"
                        />
                    </div>
                    <SheetFooter className="border-sidebar-border/70 flex-row gap-2 border-t px-4 py-3">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setPeriodOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            className="flex-1"
                            onClick={() => {
                                onPeriodApply(draftInicio, draftFim);
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
