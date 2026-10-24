import ConfirmDeleteModal from '@/components/extrato/ConfirmDeleteModal';
import { MobileFab, PageTitle } from '@/components/padrões';
import ProdutosForm from '@/components/produtos/ProdutosForm';
import ProdutosTable from '@/components/produtos/ProdutosTable';
import { visitProdutos } from '@/components/produtos/produtosQuery';
import { produtosDaPagina, type ProdutoFilters, type ProdutoItem } from '@/components/produtos/types';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Deferred, Head, router, usePage } from '@inertiajs/react';
import { Package, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produtos',
        href: '/produtos',
    },
];

type PageProps = {
    filters: ProdutoFilters;
    produtos?: unknown;
};

export default function ProdutosIndex() {
    const { props } = usePage<PageProps>();
    const filters = props.filters;
    const { items, meta } = produtosDaPagina(props.produtos);
    const [busca, setBusca] = useState(String(filters.busca ?? ''));
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [produtoEdit, setProdutoEdit] = useState<ProdutoItem | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [produtoToDelete, setProdutoToDelete] = useState<ProdutoItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setBusca(String(filters.busca ?? ''));
    }, [filters.busca]);

    useEffect(() => {
        const trimmed = busca.trim();
        const current = String(filters.busca ?? '').trim();
        if (trimmed === current) {
            return;
        }

        const timer = window.setTimeout(() => {
            visitProdutos(filters, { busca: trimmed || null, page: 1 });
        }, 400);

        return () => window.clearTimeout(timer);
    }, [busca, filters]);

    function openCreate(): void {
        setFormMode('create');
        setProdutoEdit(null);
        setFormOpen(true);
    }

    function openEdit(item: ProdutoItem): void {
        setFormMode('edit');
        setProdutoEdit(item);
        setFormOpen(true);
    }

    function openDelete(item: ProdutoItem): void {
        setProdutoToDelete(item);
        setConfirmOpen(true);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produtos" />
            <div className="flex h-full w-full max-w-full min-w-0 flex-1 flex-col gap-2 overflow-x-hidden rounded-xl p-4 pb-28 md:gap-4 md:pb-4">
                <PageTitle
                    title="Produtos"
                    subtitle="Cadastre e gerencie os produtos"
                    actions={
                        <Button variant="primary" size="default" className="hidden items-center gap-2 md:inline-flex" onClick={openCreate}>
                            <Plus className="h-4 w-4" />
                            Adicionar produto
                        </Button>
                    }
                />

                <MobileFab
                    actions={[
                        {
                            key: 'novo-produto',
                            label: '+ Novo Produto',
                            icon: <Package className="h-4 w-4" />,
                            className: 'bg-amber-500 text-white hover:bg-amber-600',
                            onClick: openCreate,
                        },
                    ]}
                />

                <Deferred data="produtos" fallback={<ProdutosTable
                    loaded={false}
                    items={null}
                    busca={busca}
                    onBuscaChange={setBusca}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    onAdd={openCreate}
                    meta={null}
                    perPage={Number(filters.per_page ?? 20)}
                    onPageChange={() => undefined}
                    onPerPageChange={() => undefined}
                    sort={String(filters.sort ?? 'nome')}
                    sortDir={String(filters.sort_dir ?? 'asc')}
                    onSort={() => undefined}
                />}>
                    <ProdutosTable
                        loaded={props.produtos != null}
                        items={items}
                        busca={busca}
                        onBuscaChange={setBusca}
                        onEdit={openEdit}
                        onDelete={openDelete}
                        onAdd={openCreate}
                        meta={meta}
                        perPage={Number(meta?.per_page ?? filters.per_page ?? 20)}
                        onPageChange={(page) => visitProdutos(filters, { page })}
                        onPerPageChange={(perPage) => visitProdutos(filters, { per_page: perPage, page: 1 })}
                        sort={String(filters.sort ?? 'nome')}
                        sortDir={String(filters.sort_dir ?? 'asc')}
                        onSort={(column, direction) => visitProdutos(filters, { sort: column, sort_dir: direction, page: 1 })}
                    />
                </Deferred>

                <ProdutosForm open={formOpen} onOpenChange={setFormOpen} mode={formMode} produto={produtoEdit} />
                <ConfirmDeleteModal
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    title="Excluir produto"
                    description={`Deseja excluir o produto "${produtoToDelete?.nome ?? ''}"? Esta ação não pode ser desfeita.`}
                    processing={deleting}
                    onConfirm={() => {
                        if (!produtoToDelete?.id) {
                            return;
                        }
                        setDeleting(true);
                        router.delete(route('produtos.destroy', produtoToDelete.id), {
                            preserveScroll: true,
                            onSuccess: () => {
                                setDeleting(false);
                                setConfirmOpen(false);
                                setProdutoToDelete(null);
                            },
                            onError: () => {
                                setDeleting(false);
                            },
                            onFinish: () => {
                                setDeleting(false);
                            },
                        });
                    }}
                />
            </div>
        </AppLayout>
    );
}
