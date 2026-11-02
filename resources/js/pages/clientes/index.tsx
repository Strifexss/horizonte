import ClientesForm from '@/components/clientes/ClientesForm';
import ClientesTable from '@/components/clientes/ClientesTable';
import { visitClientes } from '@/components/clientes/clientesQuery';
import { clientesDaPagina, type ClienteFilters, type ClienteItem } from '@/components/clientes/types';
import ConfirmDeleteModal from '@/components/extrato/ConfirmDeleteModal';
import { MobileFab, PageTitle } from '@/components/padrões';
import { Button } from '@/components/ui/button';
import { useAbrirNovoPelaUrl } from '@/hooks/use-abrir-novo-pela-url';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Deferred, Head, router, usePage } from '@inertiajs/react';
import { Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clientes',
        href: '/clientes',
    },
];

type PageProps = {
    filters: ClienteFilters;
    clientes?: unknown;
};

export default function ClientesIndex() {
    const { props } = usePage<PageProps>();
    const filters = props.filters;
    const { items, meta } = clientesDaPagina(props.clientes);
    const [busca, setBusca] = useState(String(filters.busca ?? ''));
    const [formOpen, setFormOpen] = useState(false);
    const [clienteEdit, setClienteEdit] = useState<ClienteItem | null>(null);
    const [clienteParaExcluir, setClienteParaExcluir] = useState<ClienteItem | null>(null);
    const [excluindo, setExcluindo] = useState(false);

    useEffect(() => {
        setBusca(String(filters.busca ?? ''));
    }, [filters.busca]);

    useEffect(() => {
        const trimmed = busca.trim();
        if (trimmed === String(filters.busca ?? '').trim()) {
            return;
        }

        const timer = window.setTimeout(() => visitClientes(filters, { busca: trimmed || null, page: 1 }), 400);

        return () => window.clearTimeout(timer);
    }, [busca, filters]);

    function abrirNovo(): void {
        setClienteEdit(null);
        setFormOpen(true);
    }

    useAbrirNovoPelaUrl(abrirNovo);

    function abrirEdicao(item: ClienteItem): void {
        setClienteEdit(item);
        setFormOpen(true);
    }

    const tableProps = {
        busca,
        onBuscaChange: setBusca,
        onEdit: abrirEdicao,
        onDelete: setClienteParaExcluir,
        onAdd: abrirNovo,
        sort: String(filters.sort ?? 'nome'),
        sortDir: String(filters.sort_dir ?? 'asc'),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />
            <div className="flex h-full w-full max-w-full min-w-0 flex-1 flex-col gap-2 overflow-x-hidden rounded-xl p-4 pb-28 md:gap-4 md:pb-4">
                <PageTitle
                    title="Clientes"
                    subtitle="Cadastre e gerencie os clientes"
                    actions={
                        <Button variant="primary" size="default" className="hidden items-center gap-2 md:inline-flex" onClick={abrirNovo}>
                            <Plus className="h-4 w-4" />
                            Adicionar cliente
                        </Button>
                    }
                />

                <MobileFab
                    actions={[
                        {
                            key: 'novo-cliente',
                            label: '+ Novo Cliente',
                            icon: <Users className="h-4 w-4" />,
                            className: 'bg-blue-600 text-white hover:bg-blue-700',
                            onClick: abrirNovo,
                        },
                    ]}
                />

                <Deferred
                    data="clientes"
                    fallback={
                        <ClientesTable
                            {...tableProps}
                            loaded={false}
                            items={null}
                            meta={null}
                            perPage={Number(filters.per_page ?? 20)}
                            onPageChange={() => undefined}
                            onPerPageChange={() => undefined}
                            onSort={() => undefined}
                        />
                    }
                >
                    <ClientesTable
                        {...tableProps}
                        loaded={props.clientes != null}
                        items={items}
                        meta={meta}
                        perPage={Number(meta?.per_page ?? filters.per_page ?? 20)}
                        onPageChange={(page) => visitClientes(filters, { page })}
                        onPerPageChange={(perPage) => visitClientes(filters, { per_page: perPage, page: 1 })}
                        onSort={(column, direction) => visitClientes(filters, { sort: column, sort_dir: direction, page: 1 })}
                    />
                </Deferred>

                <ClientesForm open={formOpen} onOpenChange={setFormOpen} cliente={clienteEdit} />
                <ConfirmDeleteModal
                    open={clienteParaExcluir !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setClienteParaExcluir(null);
                        }
                    }}
                    title="Excluir cliente"
                    description={`Deseja excluir o cliente "${clienteParaExcluir?.nome ?? ''}"? Esta ação não pode ser desfeita.`}
                    processing={excluindo}
                    onConfirm={() => {
                        if (!clienteParaExcluir) {
                            return;
                        }
                        setExcluindo(true);
                        router.delete(route('clientes.destroy', clienteParaExcluir.id), {
                            preserveScroll: true,
                            onFinish: () => {
                                setExcluindo(false);
                                setClienteParaExcluir(null);
                            },
                        });
                    }}
                />
            </div>
        </AppLayout>
    );
}
