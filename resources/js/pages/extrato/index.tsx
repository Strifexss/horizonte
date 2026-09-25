import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { CreditCard, ChevronDown, Plus, BarChart2, ArrowUpRight, ArrowDownRight, Grid, File, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { PageTitle, KpisPanel, CardList } from '@/components/padrões';
import ExtratoFilters from '@/components/extrato/Filters';
import ExtratoFooter from '@/components/extrato/Footer';
import ExtratoTableToolbar, { type ExtratoStatusTab } from '@/components/extrato/ExtratoTableToolbar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import CategoriasModal from '../../components/categorias/CategoriasModal';
import ProdutosModal from '@/components/produtos/ProdutosModal';
import FuncionariosModal from '@/components/funcionarios/FuncionariosModal';
import ExtratoModal, { type ExtratoModalParcela } from '@/components/extrato/ExtratoModal';
import ConfirmDeleteModal from '@/components/extrato/ConfirmDeleteModal';
import ExtratoFab from '@/components/extrato/ExtratoFab';

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

function statusDaParcela(p: { valor?: number | string | null; valor_pago?: number | string | null }): Exclude<ExtratoStatusTab, 'todos'> {
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

function tipoDaParcela(p: { financeiro?: { tipo?: string } | null }): string {
    return String(p.financeiro?.tipo ?? '').toUpperCase();
}

export default function Extrato() {
    const { props } = usePage();
    const parcelas = (props as any).parcelas;
    const parcelasArray: any[] | null = Array.isArray(parcelas) ? parcelas : (parcelas && Array.isArray(parcelas.data) ? parcelas.data : null);
    const [categoriasOpen, setCategoriasOpen] = useState(false);
    const [produtosOpen, setProdutosOpen] = useState(false);
    const [funcionariosOpen, setFuncionariosOpen] = useState(false);
    const [extratoOpen, setExtratoOpen] = useState(false);
    const [extratoMode, setExtratoMode] = useState<'create' | 'edit'>('create');
    const [parcelaEdit, setParcelaEdit] = useState<ExtratoModalParcela | null>(null);
    const [busca, setBusca] = useState('');
    const [statusTab, setStatusTab] = useState<ExtratoStatusTab>('todos');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [parcelaToDelete, setParcelaToDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);

    const counts = useMemo(() => {
        const list = parcelasArray ?? [];
        const next = { todos: list.length, aberto: 0, pago: 0, parcial: 0 };
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

    const columns = [
        { key: 'data_competencia', label: 'COMP.', thClassName: 'w-24', render: (p: any) => formatDateISO(p.data_competencia) },
        { key: 'data_vencimento', label: 'VENC.', thClassName: 'w-24', render: (p: any) => formatDateISO(p.data_vencimento) },
        {
            key: 'descricao',
            label: 'DESCRIÇÃO',
            thClassName: 'w-40',
            render: (p: any) => {
                const isReceita = tipoDaParcela(p) === 'RECEITA';
                return (
                    <div className="flex items-center gap-2 min-w-0 max-w-full">
                        <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isReceita ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-red-50 dark:bg-red-900/30 text-red-600'}`}>
                            {isReceita ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </span>
                        <span className="truncate font-medium text-dark">{p.descricao}</span>
                    </div>
                );
            },
        },
        {
            key: 'produto',
            label: 'PRODUTO',
            thClassName: 'min-w-0 flex-1',
            render: (p: any) => {
                const nome = p.produto?.nome;
                return nome ? <span className="truncate">{nome}</span> : '';
            },
        },
        {
            key: 'categoria',
            label: 'CATEGORIA',
            thClassName: 'w-40',
            render: (p: any) => {
                const nome = p.categoria?.nome;
                const isReceita = tipoDaParcela(p) === 'RECEITA';
                return nome ? <span className={`inline-block max-w-full truncate rounded px-1.5 py-0.5 text-xs font-medium ${isReceita ? 'bg-green-50 dark:bg-green-900/30 text-green-700' : 'bg-red-50 dark:bg-red-900/30 text-red-700'}`}>{nome}</span> : '';
            },
        },
        {
            key: 'conta',
            label: 'CONTA',
            thClassName: 'w-24',
            render: (p: any) => <span className="truncate">{p.conta?.nome ?? ''}</span>,
        },
        {
            key: 'valor',
            label: 'VALOR',
            thClassName: 'w-28 text-right',
            render: (p: any) => {
                const isReceita = tipoDaParcela(p) === 'RECEITA';
                return (
                    <div className={`text-right ${isReceita ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Number(p.valor ?? 0))}
                    </div>
                );
            },
        },
        {
            key: 'valor_pago',
            label: 'PAGO',
            thClassName: 'w-28 text-right',
            render: (p: any) => {
                const isReceita = tipoDaParcela(p) === 'RECEITA';
                return (
                    <div className={`text-right ${isReceita ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Number(p.valor_pago ?? 0))}
                    </div>
                );
            },
        },
        {
            key: 'status',
            label: 'STATUS',
            thClassName: 'w-20 text-center',
            render: (p: any) => {
                const status = statusDaParcela(p);
                const labels = { aberto: 'ABERTO', pago: 'PAGO', parcial: 'PARCIAL' } as const;
                const colorClass = {
                    aberto: 'bg-primary/10 text-primary',
                    pago: 'bg-green-50 dark:bg-green-900/30 text-green-700',
                    parcial: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700',
                }[status];

                return (
                    <span className={`inline-block rounded px-1 py-0.5 text-xs font-medium ${colorClass}`}>
                        {labels[status]}
                    </span>
                );
            },
        },
        {
            key: 'acoes',
            label: 'AÇÃO',
            thClassName: 'w-16 text-center',
            render: (p: any) => (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onSelect={() => {
                                    setExtratoMode('edit');
                                    setParcelaEdit(p as ExtratoModalParcela);
                                    setExtratoOpen(true);
                                }}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    setParcelaToDelete(p);
                                    setConfirmDeleteOpen(true);
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Extrato" />
            <div className="flex h-full w-full min-w-0 max-w-full flex-1 flex-col gap-4 overflow-x-hidden rounded-xl p-4 pb-28 md:pb-4">
                <CategoriasModal open={categoriasOpen} onOpenChange={setCategoriasOpen} />
                <ProdutosModal open={produtosOpen} onOpenChange={setProdutosOpen} />
                <FuncionariosModal open={funcionariosOpen} onOpenChange={setFuncionariosOpen} />
                <PageTitle
                    title="Extrato Financeiro de Contas"
                    mobileTitle="Extrato"
                    subtitle="Visualize e gerencie os lançamentos da sua conta"
                    actions={
                        <>
                            <button
                                type="button"
                                className="inline-flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-base font-medium text-teal-700 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
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
                                        <DropdownMenuItem onSelect={() => setProdutosOpen(true)}>Produtos</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setFuncionariosOpen(true)}>Funcionários</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <button
                                type="button"
                                className="inline-flex items-center gap-3 rounded-lg bg-amber-500 px-4 py-2 text-base font-medium text-white hover:bg-amber-600"
                                onClick={() => {
                                    setExtratoMode('create');
                                    setParcelaEdit(null);
                                    setExtratoOpen(true);
                                }}
                            >
                                <Plus className="h-5 w-5" />
                                Adicionar lançamento
                            </button>
                        </>
                    }
                />
                <ExtratoFab
                    onNovoLancamento={() => {
                        setExtratoMode('create');
                        setParcelaEdit(null);
                        setExtratoOpen(true);
                    }}
                    onCadastrarFuncionario={() => setFuncionariosOpen(true)}
                    onCadastrarProduto={() => setProdutosOpen(true)}
                />
                <ExtratoModal open={extratoOpen} onOpenChange={setExtratoOpen} mode={extratoMode} parcela={parcelaEdit} />
                <ConfirmDeleteModal
                    open={confirmDeleteOpen}
                    onOpenChange={setConfirmDeleteOpen}
                    title="Excluir parcela"
                    description={`Deseja excluir a parcela "${parcelaToDelete?.descricao ?? ''}"? Esta ação não pode ser desfeita.`}
                    processing={deleting}
                    onConfirm={() => {
                        if (!parcelaToDelete?.id) return;
                        setDeleting(true);
                        router.delete(route('parcela.destroy', { id: parcelaToDelete.id }), {
                            preserveState: true,
                            preserveScroll: true,
                            onSuccess: () => {
                                setDeleting(false);
                                setConfirmDeleteOpen(false);
                                setParcelaToDelete(null);
                            },
                            onError: () => {
                                setDeleting(false);
                            },
                        });
                    }}
                />

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
                    <div className="rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:bg-slate-900">
                        <div className="border-b border-sidebar-border/70 px-4 py-3">
                            <ExtratoTableToolbar
                                busca={busca}
                                onBuscaChange={setBusca}
                                status={statusTab}
                                onStatusChange={setStatusTab}
                                counts={counts}
                            />
                        </div>
                        <div className="md:hidden p-4"><CardList columns={columns} data={parcelasFiltradas} /></div>
                        <div className="hidden md:block overflow-x-auto p-4">
                            <table className="w-full table-fixed text-sm border-collapse">
                                <thead>
                                    <tr className="text-left text-xs text-muted-foreground bg-transparent">
                                        {columns.map((c) => (
                                            <th key={c.key} className={`px-4 py-3 ${c.thClassName ?? ''}`}>{c.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parcelasFiltradas.map((item: any, rowIndex: number) => (
                                        <tr key={item.id ?? rowIndex} className="border-t hover:bg-slate-50/50 dark:hover:bg-slate-700/60">
                                            {columns.map((c) => (
                                                <td key={c.key} className="px-4 py-3 align-top">
                                                    {c.render ? c.render(item) : String(item[c.key] ?? '')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <ExtratoFooter showing={parcelasArray ? parcelasArray.length : 0} total={83} />
            </div>
        </AppLayout>
    );
}
