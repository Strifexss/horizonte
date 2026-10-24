import ConfirmDeleteModal from '@/components/extrato/ConfirmDeleteModal';
import { formasPagamentoDaColecao } from '@/components/formas-pagamento/types';
import { MobileFab, PageTitle } from '@/components/padrões';
import { Button } from '@/components/ui/button';
import { formatCurrency, vendasDaPagina, type Venda, type VendaFilters, type VendaResumo, type VendaStatusTab } from '@/components/vendas/types';
import VendaModal from '@/components/vendas/VendaModal';
import VendasFilters from '@/components/vendas/VendasFilters';
import { visitVendas } from '@/components/vendas/vendasQuery';
import VendasTable from '@/components/vendas/VendasTable';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Deferred, Head, router, usePage } from '@inertiajs/react';
import { CreditCard, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vendas',
        href: '/vendas',
    },
];

type PageProps = {
    filters: VendaFilters;
    formas_pagamento?: unknown;
    possui_conta: boolean;
    resumo?: VendaResumo;
    vendas?: unknown;
};

const EMPTY_COUNTS: Record<VendaStatusTab, number> = {
    todos: 0,
    aberta: 0,
    fechada: 0,
    cancelada: 0,
};

function descricaoCancelamento(venda: Venda | null): string {
    if (!venda) {
        return '';
    }

    const base = `A venda #${venda.id} (${formatCurrency(Number(venda.total))}) ficará com status cancelada.`;

    return venda.status === 'fechada'
        ? `${base} As receitas que ela gerou no Extrato serão excluídas, inclusive as que já tiveram baixa. Esta ação não pode ser desfeita.`
        : `${base} Esta ação não pode ser desfeita.`;
}

export default function VendasIndex() {
    const { props } = usePage<PageProps>();
    const filters = props.filters;
    const formasPagamento = formasPagamentoDaColecao(props.formas_pagamento) ?? [];
    const { items, meta } = vendasDaPagina(props.vendas);
    const statusTab: VendaStatusTab = filters.status ?? 'todos';
    const counts = props.resumo?.counts ?? EMPTY_COUNTS;
    const [modalOpen, setModalOpen] = useState(false);
    const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
    const [vendaParaCancelar, setVendaParaCancelar] = useState<Venda | null>(null);
    const [cancelando, setCancelando] = useState(false);

    function abrirNova(): void {
        setVendaSelecionada(null);
        setModalOpen(true);
    }

    function abrirVenda(venda: Venda): void {
        setVendaSelecionada(venda);
        setModalOpen(true);
    }

    function confirmarCancelamento(): void {
        if (!vendaParaCancelar) {
            return;
        }

        setCancelando(true);
        router.post(
            route('vendas.cancelar', vendaParaCancelar.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setVendaParaCancelar(null);
                    setModalOpen(false);
                },
                onFinish: () => setCancelando(false),
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendas" />
            <div className="flex h-full w-full max-w-full min-w-0 flex-1 flex-col gap-2 overflow-x-hidden rounded-xl p-4 pb-28 md:gap-4 md:pb-4">
                <PageTitle
                    title="Vendas"
                    subtitle="Registre vendas com itens e formas de pagamento"
                    actions={
                        <Button variant="primary" size="default" className="hidden items-center gap-2 md:inline-flex" onClick={abrirNova}>
                            <Plus className="h-4 w-4" />
                            Nova venda
                        </Button>
                    }
                />

                <MobileFab
                    actions={[
                        {
                            key: 'nova-venda',
                            label: '+ Nova Venda',
                            icon: <ShoppingCart className="h-4 w-4" />,
                            className: 'bg-amber-500 text-white hover:bg-amber-600',
                            onClick: abrirNova,
                        },
                        {
                            key: 'formas-pagamento',
                            label: 'Formas de pagamento',
                            icon: <CreditCard className="h-4 w-4" />,
                            onClick: () => router.visit(route('formas-pagamento')),
                        },
                    ]}
                />

                <VendasFilters filters={filters} formasPagamento={formasPagamento} onApply={(next) => visitVendas(next, { page: 1 })} />

                <Deferred
                    data="vendas"
                    fallback={
                        <VendasTable
                            loaded={false}
                            items={null}
                            meta={null}
                            status={statusTab}
                            onStatusChange={() => undefined}
                            counts={counts}
                            perPage={Number(filters.per_page ?? 20)}
                            onPageChange={() => undefined}
                            onPerPageChange={() => undefined}
                            onOpen={abrirVenda}
                            onCancelar={setVendaParaCancelar}
                            onAdd={abrirNova}
                        />
                    }
                >
                    <VendasTable
                        loaded={props.vendas != null}
                        items={items}
                        meta={meta}
                        status={statusTab}
                        onStatusChange={(status) => visitVendas(filters, { status, page: 1 })}
                        counts={counts}
                        perPage={Number(meta?.per_page ?? filters.per_page ?? 20)}
                        onPageChange={(page) => visitVendas(filters, { page })}
                        onPerPageChange={(perPage) => visitVendas(filters, { per_page: perPage, page: 1 })}
                        onOpen={abrirVenda}
                        onCancelar={setVendaParaCancelar}
                        onAdd={abrirNova}
                    />
                </Deferred>

                <VendaModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    venda={vendaSelecionada}
                    formasPagamento={formasPagamento}
                    possuiConta={props.possui_conta}
                    onCancelar={setVendaParaCancelar}
                />

                <ConfirmDeleteModal
                    open={vendaParaCancelar !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setVendaParaCancelar(null);
                        }
                    }}
                    title="Cancelar venda"
                    description={descricaoCancelamento(vendaParaCancelar)}
                    confirmLabel="Cancelar venda"
                    cancelLabel="Voltar"
                    processing={cancelando}
                    onConfirm={confirmarCancelamento}
                />
            </div>
        </AppLayout>
    );
}
