import ConfirmDeleteModal from '@/components/extrato/ConfirmDeleteModal';
import FormasPagamentoForm from '@/components/formas-pagamento/FormasPagamentoForm';
import FormasPagamentoTable from '@/components/formas-pagamento/FormasPagamentoTable';
import { formasPagamentoDaColecao, type FormaPagamentoItem } from '@/components/formas-pagamento/types';
import { MobileFab, PageTitle } from '@/components/padrões';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Deferred, Head, router, usePage } from '@inertiajs/react';
import { CreditCard, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Formas de pagamento',
        href: '/formas-pagamento',
    },
];

type PageProps = {
    formas_pagamento?: unknown;
};

export default function FormasPagamentoIndex() {
    const { props } = usePage<PageProps>();
    const formas = formasPagamentoDaColecao(props.formas_pagamento) ?? [];
    const [formOpen, setFormOpen] = useState(false);
    const [formaEdit, setFormaEdit] = useState<FormaPagamentoItem | null>(null);
    const [formaToDelete, setFormaToDelete] = useState<FormaPagamentoItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    function openCreate(): void {
        setFormaEdit(null);
        setFormOpen(true);
    }

    function openEdit(item: FormaPagamentoItem): void {
        setFormaEdit(item);
        setFormOpen(true);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Formas de pagamento" />
            <div className="flex h-full w-full max-w-full min-w-0 flex-1 flex-col gap-2 overflow-x-hidden rounded-xl p-4 pb-28 md:gap-4 md:pb-4">
                <PageTitle
                    title="Formas de pagamento"
                    subtitle="As padrões valem para todos; as suas aparecem só para você"
                    actions={
                        <Button variant="primary" size="default" className="hidden items-center gap-2 md:inline-flex" onClick={openCreate}>
                            <Plus className="h-4 w-4" />
                            Adicionar forma
                        </Button>
                    }
                />

                <MobileFab
                    actions={[
                        {
                            key: 'nova-forma',
                            label: '+ Nova Forma',
                            icon: <CreditCard className="h-4 w-4" />,
                            className: 'bg-amber-500 text-white hover:bg-amber-600',
                            onClick: openCreate,
                        },
                        {
                            key: 'vendas',
                            label: 'Vendas',
                            icon: <ShoppingCart className="h-4 w-4" />,
                            onClick: () => router.visit(route('vendas')),
                        },
                    ]}
                />

                <Deferred
                    data="formas_pagamento"
                    fallback={<FormasPagamentoTable loaded={false} items={[]} onEdit={openEdit} onDelete={setFormaToDelete} />}
                >
                    <FormasPagamentoTable loaded={props.formas_pagamento != null} items={formas} onEdit={openEdit} onDelete={setFormaToDelete} />
                </Deferred>

                <FormasPagamentoForm open={formOpen} onOpenChange={setFormOpen} forma={formaEdit} />
                <ConfirmDeleteModal
                    open={formaToDelete !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setFormaToDelete(null);
                        }
                    }}
                    title="Excluir forma de pagamento"
                    description={`A forma "${formaToDelete?.nome ?? ''}" só é excluída se nunca foi usada. Se já foi, desative-a em Editar.`}
                    processing={deleting}
                    onConfirm={() => {
                        if (!formaToDelete) {
                            return;
                        }
                        setDeleting(true);
                        router.delete(route('formas-pagamento.destroy', formaToDelete.id), {
                            preserveScroll: true,
                            onSuccess: () => setFormaToDelete(null),
                            onFinish: () => setDeleting(false),
                        });
                    }}
                />
            </div>
        </AppLayout>
    );
}
