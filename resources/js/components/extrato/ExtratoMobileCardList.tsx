import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ExtratoItem = {
    id?: number | string;
    descricao?: string | null;
    data_competencia?: string | null;
    data_vencimento?: string | null;
    valor?: number | string | null;
    valor_pago?: number | string | null;
    categoria?: { nome?: string | null } | null;
    conta?: { nome?: string | null } | null;
    produto?: { nome?: string | null } | null;
    funcionario?: { nome?: string | null } | null;
    financeiro?: { tipo?: string | null } | null;
};

function formatDateISO(dateISO: string | null | undefined): string {
    if (!dateISO) {
        return '—';
    }

    try {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(dateISO));
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

export default function ExtratoMobileCardList({ data, onEdit, onDelete }: Props) {
    const [selected, setSelected] = useState<ExtratoItem | null>(null);

    return (
        <>
            <div className="flex flex-col gap-2 md:hidden">
                {data.map((item, index) => {
                    const isReceita = tipoDaParcela(item) === 'RECEITA';
                    const status = statusDaParcela(item);
                    const statusMeta = STATUS_META[status];
                    const metaParts = [
                        formatDateISO(item.data_vencimento),
                        item.conta?.nome,
                        item.categoria?.nome,
                    ].filter(Boolean);

                    return (
                        <button
                            key={item.id ?? index}
                            type="button"
                            className="w-full rounded-xl border border-sidebar-border/70 bg-white p-3 text-left shadow-sm transition-colors active:bg-slate-50 dark:bg-slate-900 dark:active:bg-slate-800"
                            onClick={() => setSelected(item)}
                        >
                            <div className="flex min-w-0 items-start justify-between gap-3">
                                <span className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                    {item.descricao || 'Sem descrição'}
                                </span>
                                <span
                                    className={`shrink-0 text-sm font-bold ${
                                        isReceita ? 'text-green-600' : 'text-red-600'
                                    }`}
                                >
                                    {formatCurrency(Number(item.valor ?? 0))}
                                </span>
                            </div>
                            <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2">
                                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-xs text-slate-500">
                                    <span className="truncate">{metaParts.join(' • ')}</span>
                                </div>
                                <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusMeta.className}`}
                                >
                                    {statusMeta.label}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent className="flex max-h-[85dvh] max-w-full flex-col overflow-hidden md:hidden">
                    <DialogHeader>
                        <DialogTitle className="pr-6 text-left">{selected?.descricao || 'Detalhes do lançamento'}</DialogTitle>
                        <DialogDescription className="text-left">
                            Detalhes completos do lançamento selecionado.
                        </DialogDescription>
                    </DialogHeader>

                    {selected ? (
                        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto text-sm">
                            <DetailRow label="Competência" value={formatDateISO(selected.data_competencia)} />
                            <DetailRow label="Vencimento" value={formatDateISO(selected.data_vencimento)} />
                            <DetailRow
                                label="Valor"
                                value={
                                    <span
                                        className={
                                            tipoDaParcela(selected) === 'RECEITA'
                                                ? 'font-semibold text-green-600'
                                                : 'font-semibold text-red-600'
                                        }
                                    >
                                        {formatCurrency(Number(selected.valor ?? 0))}
                                    </span>
                                }
                            />
                            <DetailRow
                                label="Valor pago"
                                value={formatCurrency(Number(selected.valor_pago ?? 0))}
                            />
                            <DetailRow label="Conta" value={selected.conta?.nome || '—'} />
                            <DetailRow label="Categoria" value={selected.categoria?.nome || '—'} />
                            {selected.produto?.nome ? (
                                <DetailRow label="Produto" value={selected.produto.nome} />
                            ) : null}
                            {selected.funcionario?.nome ? (
                                <DetailRow label="Funcionário" value={selected.funcionario.nome} />
                            ) : null}
                            <DetailRow
                                label="Status"
                                value={
                                    <span
                                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_META[statusDaParcela(selected)].className}`}
                                    >
                                        {STATUS_META[statusDaParcela(selected)].label}
                                    </span>
                                }
                            />
                        </div>
                    ) : null}

                    <DialogFooter className="flex-row gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" className="flex-1">
                                Fechar
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                if (!selected) {
                                    return;
                                }
                                const item = selected;
                                setSelected(null);
                                onEdit(item);
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                            Editar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                                if (!selected) {
                                    return;
                                }
                                const item = selected;
                                setSelected(null);
                                onDelete(item);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-3 border-b border-sidebar-border/50 pb-2 last:border-b-0">
            <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
            <span className="min-w-0 text-right font-medium text-slate-800 dark:text-slate-100">{value}</span>
        </div>
    );
}
