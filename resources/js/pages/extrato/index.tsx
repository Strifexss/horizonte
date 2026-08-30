import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CreditCard, ChevronDown, Plus, BarChart2, ArrowUpRight, ArrowDownRight, Grid, File} from 'lucide-react';
import { PageTitle, KpisPanel, TableWithFilters } from '@/components/padrões';
import ExtratoFilters from '@/components/extrato/Filters';
import ExtratoFooter from '@/components/extrato/Footer';
import ExtratoTableToolbar, { type ExtratoStatusTab } from '@/components/extrato/ExtratoTableToolbar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import CategoriasModal from '../../components/categorias/CategoriasModal';
import ExtratoModal from '@/components/extrato/ExtratoModal';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Extrato',
        href: '/extrato',
    },
];

function formatDateISO(dateISO: string) {
    try {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(dateISO));
    } catch {
        return dateISO;
    }
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function statusDaParcela(p: { status?: ExtratoStatusTab }): Exclude<ExtratoStatusTab, 'todos'> {
    const status = p.status;
    if (status === 'liquidado' || status === 'conferido' || status === 'conciliado' || status === 'em_aberto') {
        return status;
    }

    return 'em_aberto';
}

function tipoDaParcela(p: { financeiro?: { tipo?: string } | null }): string {
    return String(p.financeiro?.tipo ?? '').toUpperCase();
}

export default function Extrato() {
    const { props } = usePage();
    const parcelas = (props as any).parcelas;
    const parcelasArray: any[] | null = Array.isArray(parcelas) ? parcelas : (parcelas && Array.isArray(parcelas.data) ? parcelas.data : null);
    const [categoriasOpen, setCategoriasOpen] = useState(false);
    const [extratoOpen, setExtratoOpen] = useState(false);
    const [busca, setBusca] = useState('');
    const [statusTab, setStatusTab] = useState<ExtratoStatusTab>('todos');

    const counts = useMemo(() => {
        const list = parcelasArray ?? [];
        const next = { todos: list.length, em_aberto: 0, liquidado: 0, conferido: 0, conciliado: 0 };
        for (const p of list) {
            next[statusDaParcela(p)] += 1;
        }

        return next;
    }, [parcelasArray]);

    const parcelasFiltradas = useMemo(() => {
        const list = parcelasArray ?? [];
        const q = busca.trim().toLowerCase();

        return list.filter((p: any) => {
            if (statusTab !== 'todos' && statusDaParcela(p) !== statusTab) {
                return false;
            }
            if (q && !String(p.descricao ?? '').toLowerCase().includes(q)) {
                return false;
            }

            return true;
        });
    }, [parcelasArray, busca, statusTab]);

    const { totalCredits, totalDebits, openingBalance, saldoTotal } = useMemo(() => {
        const list = parcelasArray ?? [];
        const entradas = list
            .filter((p: any) => tipoDaParcela(p) === 'RECEITA')
            .reduce((sum: number, p: any) => sum + Number(p.valor ?? 0), 0);
        const saidas = list
            .filter((p: any) => tipoDaParcela(p) === 'DESPESA')
            .reduce((sum: number, p: any) => sum + Number(p.valor ?? 0), 0);
        const anterior = 0;

        return {
            totalCredits: entradas,
            totalDebits: saidas,
            openingBalance: anterior,
            saldoTotal: anterior + entradas - saidas,
        };
    }, [parcelasArray]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Extrato" />
            <div className="flex w-[100vw] md:w-auto h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <CategoriasModal open={categoriasOpen} onOpenChange={setCategoriasOpen} />
                <PageTitle
                    title="Extrato Financeiro de Contas"
                    subtitle="Visualize e gerencie os lançamentos da sua conta"
                    actions={
                        <>
                            <button
                                type="button"
                                className="hidden md:inline-flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-base font-medium text-teal-700 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                            >
                                <File className="h-5 w-5" />
                                Importar Extrato
                            </button>

                            <div className="relative">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-3 rounded-lg border border-sidebar-border/70 bg-white px-4 py-2 text-base font-medium text-muted-foreground hover:bg-sidebar-border/50 dark:bg-slate-800 dark:text-muted-foreground"
                                        >
                                            Ações
                                            <ChevronDown className="h-5 w-5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuItem onSelect={() => setCategoriasOpen(true)}>Categorias</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setExtratoOpen(true)}><span className="md:hidden flex items-center gap-2 mt-2"><File className="h-5 w-5" />Importar Extrato</span></DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <button
                                type="button"
                                className="inline-flex items-center gap-3 rounded-lg bg-amber-500 px-4 py-2 text-base font-medium text-white hover:bg-amber-600"
                                onClick={() => setExtratoOpen(true)}
                            >
                                <Plus className="h-5 w-5" />
                                Adicionar lançamento
                            </button>
                        </>
                    }
                />
                <ExtratoModal open={extratoOpen} onOpenChange={setExtratoOpen} />

                <ExtratoFilters />
                <KpisPanel
                    items={[
                        { id: 'prev', label: 'Saldo Anterior', value: formatCurrency(openingBalance), hint: 'Antes do período', icon: <BarChart2 className="h-8 w-8 text-muted-foreground" /> },
                        { id: 'in', label: 'Entradas', value: <span className="text-green-600">{formatCurrency(totalCredits)}</span>, hint: '+85% do total', icon: <ArrowUpRight className="h-8 w-8 text-green-600" /> },
                        { id: 'out', label: 'Saídas', value: <span className="text-red-600">{formatCurrency(totalDebits)}</span>, hint: '-15% do total', icon: <ArrowDownRight className="h-8 w-8 text-red-600" /> },
                        { 
                            id: 'total', 
                            label: 'Saldo Total', 
                            value: (
                                <span className={saldoTotal < 0 ? "text-red-600" : "text-green-600"}>
                                    {formatCurrency(saldoTotal)}
                                </span>
                            ),
                            hint: saldoTotal < 0 ? 'Saldo negativo' : 'Saldo positivo',
                            icon: <Grid className="h-8 w-8 text-muted-foreground" /> 
                        },
                   
                    ]}
                />
                {!parcelas ? (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-slate-700" />
                        <div className="h-48 rounded bg-gray-100 dark:bg-slate-800" />
                    </div>
                ) : (
                    <TableWithFilters
                        toolbar={
                            <ExtratoTableToolbar
                                busca={busca}
                                onBuscaChange={setBusca}
                                status={statusTab}
                                onStatusChange={setStatusTab}
                                counts={counts}
                            />
                        }
                        columns={[
                            { key: 'data_competencia', label: 'DATA COMPETÊNCIA', thClassName: 'w-36', render: (p: any) => formatDateISO(p.data_competencia) },
                            { key: 'data_vencimento', label: 'DATA VENCIMENTO', thClassName: 'w-36', render: (p: any) => formatDateISO(p.data_vencimento) },
                            {
                                key: 'descricao',
                                label: 'DESCRIÇÃO',
                                thClassName: 'w-60',
                                render: (p: any) => {
                                    const isReceita = tipoDaParcela(p) === 'RECEITA';
                                    return (
                                        <div className="flex items-start gap-3">
                                            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${isReceita ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-red-50 dark:bg-red-900/30 text-red-600'}`}>
                                                {isReceita ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                            </span>
                                            <div>
                                                <div className="font-medium text-dark">{p.descricao}</div>
                                            </div>
                                        </div>
                                    );
                                },
                            },
                            {
                                key: 'categoria',
                                label: 'CATEGORIA',
                                thClassName: 'w-36',
                                render: (p: any) => {
                                    const nome = p.financeiro?.categoria?.nome;
                                    const isReceita = tipoDaParcela(p) === 'RECEITA';
                                    return nome ? <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${isReceita ? 'bg-green-50 dark:bg-green-900/30 text-green-700' : 'bg-red-50 dark:bg-red-900/30 text-red-700'}`}>{nome}</span> : '';
                                },
                            },
                            {
                                key: 'conta',
                                label: 'CONTA',
                                thClassName: 'w-36',
                                render: (p: any) => p.financeiro?.conta?.nome ?? '',
                            },
                            { 
                                key: 'valor', 
                                label: 'VALOR', 
                                thClassName: 'w-36 text-right', 
                                render: (p: any) => {
                                    const isReceita = tipoDaParcela(p) === 'RECEITA';
                                    return (
                                    <div className={`w-full text-right ${isReceita ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(Number(p.valor ?? 0))}
                                    </div>
                                )
                                }
                            },
                            { 
                                key: 'valor_pago', 
                                label: 'Valor Pago', 
                                thClassName: 'w-36 text-right', 
                                render: (p: any) => {
                                    const isReceita = tipoDaParcela(p) === 'RECEITA';
                                    return (
                                        <div className={`w-full text-right ${isReceita ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(Number(p.valor_pago ?? 0))}
                                        </div>
                                    );
                                }
                            },
                            {
                                key: 'status',
                                label: 'STATUS',
                                thClassName: 'w-32 text-center',
                                render: (p: any) => {
                                    const valor = Number(p.valor ?? 0);
                                    const valorPago = Number(p.valor_pago ?? 0);
                                    let status = '';
                                    let colorClass = '';

                                    if (!valorPago || valorPago === 0) {
                                        status = 'ABERTO';
                                        colorClass = 'bg-primary/10 text-primary';
                                    } else if (valorPago >= valor) {
                                        status = 'PAGO';
                                        colorClass = 'bg-green-50 dark:bg-green-900/30 text-green-700';
                                    } else {
                                        status = 'PARCIAL';
                                        colorClass = 'bg-blue-50 dark:bg-blue-900/30 text-blue-700';
                                    }

                                    return (
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                                            {status}
                                        </span>
                                    );
                                },
                            },
                       
                        ]}
                        data={parcelasFiltradas}
                    />
              
                )}

                <ExtratoFooter showing={parcelasArray ? parcelasArray.length : 0} total={83} />
            </div>
        </AppLayout>
    );
}
