import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { CreditCard, ChevronDown, Plus, BarChart2, ArrowUpRight, ArrowDownRight, Grid, MoreHorizontal, Pencil, Trash2, File, ArrowUp, ArrowDown } from 'lucide-react';
import { PageTitle, KpisPanel } from '@/components/padrões';
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
import FornecedoresModal from '@/components/fornecedores/FornecedoresModal';
import ExtratoModal, { type ExtratoModalParcela } from '@/components/extrato/ExtratoModal';
import ConfirmDeleteModal from '@/components/extrato/ConfirmDeleteModal';
import ExtratoFab2 from '@/components/extrato/ExtratoFab2';
import ExtratoMobileCardList from '@/components/extrato/ExtratoMobileCardList';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Extrato',
        href: '/extrato',
    },
];

function formatDateISO(dateISO: string) {
    try {
        const [year, month, day] = dateISO.split('-').map(Number);
        return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
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
    const filters = ((props as any).filters ?? {}) as {
        tipo_data?: string;
        data_inicio?: string;
        data_fim?: string;
        conta_id?: number;
        categoria_id?: number;
        status?: string;
        busca?: string;
        per_page?: number;
    };
    const resumo = (props as any).resumo as
        | {
              counts?: { todos: number; aberto: number; pago: number; parcial: number };
              total_credits?: number;
              total_debits?: number;
          }
        | undefined;
    const parcelas = (props as any).parcelas;
    const parcelasArray: any[] | null = Array.isArray(parcelas)
        ? parcelas
        : parcelas && Array.isArray(parcelas.data)
          ? parcelas.data
          : null;
    const paginationMeta = parcelas && !Array.isArray(parcelas) ? (parcelas.meta ?? null) : null;
    const [categoriasOpen, setCategoriasOpen] = useState(false);
    const [produtosOpen, setProdutosOpen] = useState(false);
    const [funcionariosOpen, setFuncionariosOpen] = useState(false);
    const [fornecedoresOpen, setFornecedoresOpen] = useState(false);
    const [extratoOpen, setExtratoOpen] = useState(false);
    const [extratoMode, setExtratoMode] = useState<'create' | 'edit'>('create');
    const [parcelaEdit, setParcelaEdit] = useState<ExtratoModalParcela | null>(null);
    const [busca, setBusca] = useState(String(filters.busca ?? ''));
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [parcelaToDelete, setParcelaToDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const pdfTimeoutRef = React.useRef<number | null>(null);

    const handleGeneratePdf = React.useCallback(() => {
        if (pdfLoading) return;
        setPdfLoading(true);

        const params = buildQuery();
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== null && v !== undefined) {
                qs.append(k, String(v));
            }
        });

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.onload = () => {
            if (pdfTimeoutRef.current) {
                clearTimeout(pdfTimeoutRef.current);
                pdfTimeoutRef.current = null;
            }
            setPdfLoading(false);
            if (iframe.parentNode) document.body.removeChild(iframe);
        };
        iframe.onerror = () => {
            if (pdfTimeoutRef.current) {
                clearTimeout(pdfTimeoutRef.current);
                pdfTimeoutRef.current = null;
            }
            setPdfLoading(false);
            if (iframe.parentNode) document.body.removeChild(iframe);
        };
        iframe.src = route('extrato.pdf') + (qs.toString() ? `?${qs.toString()}` : '');
        document.body.appendChild(iframe);

        if (pdfTimeoutRef.current) {
            clearTimeout(pdfTimeoutRef.current);
        }
        pdfTimeoutRef.current = window.setTimeout(() => {
            setPdfLoading(false);
            if (iframe.parentNode) document.body.removeChild(iframe);
            pdfTimeoutRef.current = null;
        }, 10000);
    }, [pdfLoading]);

    const statusTab = (filters.status as ExtratoStatusTab) || 'todos';
    const perPage = Number(paginationMeta?.per_page ?? filters.per_page ?? 20);

    React.useEffect(() => {
        setBusca(String(filters.busca ?? ''));
    }, [filters.busca]);

    const buildQuery = (override: Record<string, string | number | null | undefined> = {}) => {
        const payload: Record<string, string | number> = {
            tipo_data: String(override.tipo_data ?? filters.tipo_data ?? 'vencimento'),
            data_inicio: String(override.data_inicio ?? filters.data_inicio ?? ''),
            data_fim: String(override.data_fim ?? filters.data_fim ?? ''),
            status: String(override.status ?? filters.status ?? 'todos'),
            per_page: Number(override.per_page ?? filters.per_page ?? 20),
            page: Number(override.page ?? 1),
        };

        const contaId = override.conta_id !== undefined ? override.conta_id : filters.conta_id;
        const categoriaId = override.categoria_id !== undefined ? override.categoria_id : filters.categoria_id;
        const buscaValue = override.busca !== undefined ? override.busca : filters.busca;
        const sortValue = override.sort !== undefined ? override.sort : (filters.sort ?? 'data');
        const sortDirValue = override.sort_dir !== undefined ? override.sort_dir : (filters.sort_dir ?? 'desc');

        if (contaId) {
            payload.conta_id = Number(contaId);
        }
        if (categoriaId) {
            payload.categoria_id = Number(categoriaId);
        }
        if (buscaValue) {
            payload.busca = String(buscaValue);
        }
        payload.sort = String(sortValue);
        payload.sort_dir = String(sortDirValue);

        return payload;
    };

    const visitExtrato = (override: Record<string, string | number | null | undefined> = {}) => {
        router.get(route('extrato.index'), buildQuery(override), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    React.useEffect(() => {
        const trimmed = busca.trim();
        const current = String(filters.busca ?? '').trim();
        if (trimmed === current) {
            return;
        }

        const timer = window.setTimeout(() => {
            visitExtrato({ busca: trimmed || null, page: 1 });
        }, 400);

        return () => window.clearTimeout(timer);
    }, [busca]);

    const counts = resumo?.counts ?? { todos: 0, aberto: 0, pago: 0, parcial: 0 };

    const totalCredits = Number(resumo?.total_credits ?? 0);
    const totalDebits = Number(resumo?.total_debits ?? 0);
    const openingBalance = 0;
    const saldoTotal = openingBalance + totalCredits - totalDebits;

    const columns = [
        { key: 'data', label: 'DATA', thClassName: 'w-24', render: (p: any) => formatDateISO(p.data_competencia) },
        {
            key: 'descricao',
            label: 'DESCRIÇÃO',
            thClassName: 'w-48',
            render: (p: any) => {
                const isReceita = tipoDaParcela(p) === 'RECEITA';
                return (
                    <div className="flex max-w-[10rem] items-center gap-2">
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
            thClassName: 'w-36',
            render: (p: any) => {
                const nome = p.produto?.nome;
                if (!nome) {
                    return '';
                }
                const grupo = p.produto?.grupo?.nome;
                const label = grupo ? `${nome} - ${grupo}` : nome;
                return <span className="truncate">{label}</span>;
            },
        },
        {
            key: 'quantidade',
            label: 'QTD',
            thClassName: 'w-16 text-center',
            render: (p: any) => {
                const isProduto = p.categoria?.nome?.toUpperCase() === 'PRODUTO' || p.produto_id != null;
                return isProduto ? <span className="text-center">{p.quantidade ?? '-'}</span> : <span className="text-center text-muted-foreground">-</span>;
            },
        },
        {
            key: 'fornecedor',
            label: 'FORNECEDOR',
            thClassName: 'w-36',
            render: (p: any) => {
                const nome = p.produto?.fornecedor?.nome ?? p.fornecedor?.nome ?? null;
                return nome ? <span className="truncate">{nome}</span> : '';
            },
        },
        {
            key: 'categoria',
            label: 'CATEGORIA',
            thClassName: 'w-36',
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
            <div className="flex h-full w-full min-w-0 max-w-full flex-1 flex-col gap-2 overflow-x-hidden rounded-xl p-4 pb-28 md:pb-4 md:gap-4">
                <CategoriasModal open={categoriasOpen} onOpenChange={setCategoriasOpen} />
                <ProdutosModal open={produtosOpen} onOpenChange={setProdutosOpen} />
                <FuncionariosModal open={funcionariosOpen} onOpenChange={setFuncionariosOpen} />
                <FornecedoresModal open={fornecedoresOpen} onOpenChange={setFornecedoresOpen} />
                <PageTitle
                    title="Extrato Financeiro de Contas"
                    mobileTitle="Extrato"
                    subtitle="Visualize e gerencie os lançamentos da sua conta"
                    actions={
                        <>
                            <div className="hidden md:block relative">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="hidden md:inline-flex items-center gap-3 rounded-lg border border-sidebar-border/70 bg-white px-4 py-2 text-base font-medium text-muted-foreground hover:bg-sidebar-border/50 dark:bg-slate-800 dark:text-muted-foreground"
                                        >
                                            Ações
                                            <ChevronDown className="h-5 w-5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuItem onSelect={() => setCategoriasOpen(true)}>Categorias</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setProdutosOpen(true)}>Produtos</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setFuncionariosOpen(true)}>Funcionários</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setFornecedoresOpen(true)}>Fornecedores</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <button
                                type="button"
                                className="hidden md:inline-flex items-center gap-3 rounded-lg border border-sidebar-border/70 bg-white px-4 py-2 text-base font-medium text-muted-foreground hover:bg-sidebar-border/50 dark:bg-slate-800 dark:text-muted-foreground"
                                onClick={() => {
                                    handleGeneratePdf();
                                }}
                                disabled={pdfLoading}
                            >
                                {pdfLoading ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
                                        <span>Gerando...</span>
                                    </>
                                ) : (
                                    <>
                                        <File className="h-5 w-5" />
                                        Gerar PDF
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="hidden md:inline-flex items-center gap-3 rounded-lg bg-amber-500 px-4 py-2 text-base font-medium text-white hover:bg-amber-600"
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
                <ExtratoFab2
                    onNovoLancamento={() => {
                        setExtratoMode('create');
                        setParcelaEdit(null);
                        setExtratoOpen(true);
                    }}
                    onCadastrarFuncionario={() => setFuncionariosOpen(true)}
                    onCadastrarProduto={() => setProdutosOpen(true)}
                    onGerarPdf={() => handleGeneratePdf()}
                />
                <ExtratoModal open={extratoOpen} onOpenChange={setExtratoOpen} mode={extratoMode} parcela={parcelaEdit} categoriasPadrao={(props as any).categorias_padrao ?? null} />
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
                        { id: 'in', label: 'Entradas', value: <span className="text-green-600">{formatCurrency(totalCredits)}</span>, hint: '', icon: <ArrowUpRight className="h-8 w-8 text-green-600" /> },
                        { id: 'out', label: 'Saídas', value: <span className="text-red-600">{formatCurrency(totalDebits)}</span>, hint: '', icon: <ArrowDownRight className="h-8 w-8 text-red-600" /> },
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
                                onStatusChange={(status) => visitExtrato({ status, page: 1 })}
                                counts={counts}
                            />
                        </div>
                        <div className="md:hidden p-3">
                            <ExtratoMobileCardList
                                data={parcelasArray ?? []}
                                onEdit={(p) => {
                                    setExtratoMode('edit');
                                    setParcelaEdit(p as ExtratoModalParcela);
                                    setExtratoOpen(true);
                                }}
                            />
                        </div>
                        <div className="hidden md:block overflow-x-auto p-4">
                            <table className="w-full table-auto text-sm border-collapse">
                                <thead>
                                    <tr className="text-left text-xs text-muted-foreground bg-transparent">
                                        {columns.map((c) => {
                                            const sortableKeys = ['data', 'descricao', 'quantidade', 'valor', 'valor_pago'];
                                            const isSortable = sortableKeys.includes(c.key);
                                            if (!isSortable) {
                                                return <th key={c.key} className={`px-4 py-3 ${c.thClassName ?? ''}`}>{c.label}</th>;
                                            }

                                            const currentSort = String(filters.sort ?? '');
                                            const currentDir = String(filters.sort_dir ?? 'desc');
                                            const isActive = currentSort === c.key;

                                            return (
                                                <th key={c.key} className={`px-4 py-3 ${c.thClassName ?? ''}`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="mr-1 text-sm">{c.label}</span>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                className={`p-0.5 ${isActive && currentDir === 'asc' ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                                                                onClick={() => visitExtrato({ sort: c.key, sort_dir: 'asc', page: 1 })}
                                                                aria-label={`Ordenar ${c.label} ascendente`}
                                                            >
                                                                <ArrowUp className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`p-0.5 ${isActive && currentDir === 'desc' ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                                                                onClick={() => visitExtrato({ sort: c.key, sort_dir: 'desc', page: 1 })}
                                                                aria-label={`Ordenar ${c.label} descendente`}
                                                            >
                                                                <ArrowDown className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(parcelasArray ?? []).map((item: any, rowIndex: number) => (
                                        <tr key={item.id ?? rowIndex} className="border-t hover:bg-slate-50/50 dark:hover:bg-slate-700/60">
                                            {columns.map((c) => (
                                                <td key={c.key} className={`px-4 py-3 align-top ${c.thClassName ?? ''}`}>
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

                <ExtratoFooter
                    from={paginationMeta?.from ?? null}
                    to={paginationMeta?.to ?? null}
                    total={Number(paginationMeta?.total ?? counts.todos ?? 0)}
                    currentPage={Number(paginationMeta?.current_page ?? 1)}
                    lastPage={Number(paginationMeta?.last_page ?? 1)}
                    perPage={perPage}
                    onPageChange={(page) => visitExtrato({ page })}
                    onPerPageChange={(nextPerPage) => visitExtrato({ per_page: nextPerPage, page: 1 })}
                />
            </div>
        </AppLayout>
    );
}
