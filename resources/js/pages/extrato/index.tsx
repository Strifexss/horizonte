import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React from 'react';
import { CreditCard, ChevronDown, Plus, BarChart2, ArrowUpRight, ArrowDownRight, Grid, File} from 'lucide-react';
import { PageTitle, KpisPanel, TableWithFilters } from '@/components/padrões';
import ExtratoFilters from '@/components/extrato/Filters';
import ExtratoFooter from '@/components/extrato/Footer';
import StatusBadge from '@/components/extrato/StatusBadge';
import Amount from '@/components/extrato/Amount';
import ActionsCell from '@/components/extrato/ActionsCell';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Extrato',
        href: '/extrato',
    },
];

type Transaction = {
    id: string;
    date: string; // ISO
    description: string;
    category?: string;
    type: 'credit' | 'debit';
    docType?: string;
    document?: string;
    status?: 'em_aberto' | 'liquidado' | 'conferido' | 'conciliado';
    amount: number; // in BRL (e.g. 123.45)
    balance: number;
};

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', date: '2026-08-25', description: 'Saldo Anterior', category: '', type: 'credit', amount: 0, balance: 128096.01 },
    { id: '2', date: '2026-08-21', description: 'Venda nº 19551', category: 'Vendas', type: 'credit', amount: 31.82, balance: 128127.83 },
    { id: '3', date: '2026-08-21', description: 'Venda nº 19551', category: 'Vendas', type: 'credit', amount: 31.81, balance: 128159.64 },
    { id: '4', date: '2026-08-21', description: 'Venda nº 19552', category: 'Vendas', type: 'credit', amount: 31.82, balance: 128191.46 },
    { id: '5', date: '2026-08-21', description: 'Venda nº 19552', category: 'Vendas', type: 'credit', amount: 31.81, balance: 128223.27 },
    { id: '6', date: '2026-08-21', description: 'Venda nº 19553', category: 'Vendas', type: 'credit', amount: 31.82, balance: 128255.09 },
    { id: '7', date: '2026-08-21', description: 'Venda nº 19553', category: 'Vendas', type: 'credit', amount: 31.81, balance: 128286.90 },
    { id: '8', date: '2026-08-21', description: 'Pagamento Fornecedor', category: 'Fornecedores', type: 'debit', amount: 200.0, balance: 128086.90 },
    { id: '9', date: '2026-08-22', description: 'Recebimento Boleto', category: 'Recebimentos', type: 'credit', amount: 1500.0, balance: 129586.90 },
    { id: '10', date: '2026-08-23', description: 'Transferência', category: 'Transferências', type: 'debit', amount: 1000.0, balance: 128586.90 },
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

export default function Extrato() {
    const transactions = MOCK_TRANSACTIONS;

    const totalCredits = transactions.filter((t) => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = transactions.filter((t) => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const openingBalance = transactions.length ? transactions[0].balance : 0;
    const currentBalance = transactions.length ? transactions[transactions.length - 1].balance : openingBalance;
    const saldoTotal = openingBalance + totalCredits - totalDebits;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Extrato" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <PageTitle
                    title="Extrato Financeiro de Contas"
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
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-3 rounded-lg border border-sidebar-border/70 bg-white px-4 py-2 text-base font-medium text-muted-foreground hover:bg-sidebar-border/50 dark:bg-slate-800 dark:text-muted-foreground"
                                >
                                    Ações
                                    <ChevronDown className="h-5 w-5" />
                                </button>
                            </div>

                            <button
                                type="button"
                                className="inline-flex items-center gap-3 rounded-lg bg-amber-500 px-4 py-2 text-base font-medium text-white hover:bg-amber-600"
                            >
                                <Plus className="h-5 w-5" />
                                Adicionar lançamento
                            </button>
                        </>
                    }
                />

                {/* Main filters moved into table header via headerFilters prop */}
                {/*
                  Build KPIs items and pass to KpisPanel so the presentation is reusable.
                */}
                <KpisPanel
                    items={[
                        { id: 'prev', label: 'Saldo Anterior', value: formatCurrency(openingBalance), hint: 'Antes do período', icon: <BarChart2 className="h-8 w-8 text-muted-foreground" /> },
                        { id: 'in', label: 'Entradas', value: formatCurrency(totalCredits), hint: '+85% do total', icon: <ArrowUpRight className="h-8 w-8 text-green-600" /> },
                        { id: 'out', label: 'Saídas', value: formatCurrency(totalDebits), hint: '-15% do total', icon: <ArrowDownRight className="h-8 w-8 text-red-600" /> },
                        { id: 'total', label: 'Saldo Total', value: formatCurrency(saldoTotal), hint: 'Saldo positivo', icon: <Grid className="h-8 w-8 text-muted-foreground" /> },
                    ]}
                />

                {/* Header filters (kept outside the generic table) */}
                <ExtratoFilters />

                <TableWithFilters
                    columns={[
                        { key: 'select', label: '' , thClassName: 'w-8', render: (t, i) => <input id={`selectedRows.${i}`} aria-label={`Selecionar ${t.description}`} className="cursor-pointer" type="checkbox" /> },
                        { key: 'date', label: 'DATA', thClassName: 'w-28', render: (t) => formatDateISO(t.date) },
                        {
                            key: 'description',
                            label: 'DESCRIÇÃO',
                            render: (t) => (
                                <div className="flex items-start gap-3">
                                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${t.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {t.type === 'credit' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                    </span>
                                    <div>
                                        <div className="font-medium text-dark">{t.description}</div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            Origem: {t.docType || '—'}{t.document ? <span className="ml-2">• {t.document}</span> : null}
                                        </div>
                                    </div>
                                </div>
                            ),
                        },
                        { key: 'category', label: 'CATEGORIA', thClassName: 'hidden md:table-cell w-40', render: (t) => (t.category ? <span className="inline-block rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">{t.category}</span> : '') },
                        { key: 'docType', label: 'TIPO DE DOC.', thClassName: 'hidden lg:table-cell w-28', render: (t) => <span className="inline-block rounded bg-muted/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">{t.docType}</span> },
                        { key: 'document', label: 'DOCUMENTO', thClassName: 'hidden lg:table-cell w-24', render: (t) => t.document },
                        { key: 'amount', label: 'VALOR', thClassName: 'w-28 text-right', render: (t) => <Amount amount={t.amount} type={t.type} formatter={formatCurrency} /> },
                        { key: 'balance', label: 'SALDO', thClassName: 'hidden lg:table-cell w-28 text-right', render: (t) => formatCurrency(t.balance) },
                        { key: 'status', label: 'STATUS', thClassName: 'w-32 text-center', render: (t) => <StatusBadge status={t.status} /> },
                        { key: 'actions', label: 'AÇÕES', thClassName: 'w-20 text-center', render: () => <ActionsCell /> },
                    ]}
                    data={transactions}
                />

                <ExtratoFooter showing={MOCK_TRANSACTIONS.length} total={83} />
            </div>
        </AppLayout>
    );
}
