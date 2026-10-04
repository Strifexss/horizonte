import CategoriasModal from '@/components/categorias/CategoriasModal';
import ConfirmDeleteModal from '@/components/extrato/ConfirmDeleteModal';
import ExtratoFab2 from '@/components/extrato/ExtratoFab2';
import ExtratoKpis from '@/components/extrato/ExtratoKpis';
import ExtratoModal, { type ExtratoModalMode, type ExtratoModalParcela } from '@/components/extrato/ExtratoModal';
import ExtratoPageActions from '@/components/extrato/ExtratoPageActions';
import ExtratoTable from '@/components/extrato/ExtratoTable';
import ExtratoFilters from '@/components/extrato/Filters';
import type { ExtratoParcela } from '@/components/extrato/types';
import { useExtratoList } from '@/components/extrato/useExtratoList';
import { useExtratoPdf } from '@/components/extrato/useExtratoPdf';
import FornecedoresModal from '@/components/fornecedores/FornecedoresModal';
import FuncionariosModal from '@/components/funcionarios/FuncionariosModal';
import { PageTitle } from '@/components/padrões';
import ProdutosModal from '@/components/produtos/ProdutosModal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Extrato',
        href: '/extrato',
    },
];

function toModalParcela(parcela: ExtratoParcela): ExtratoModalParcela {
    return parcela;
}

export default function Extrato() {
    const { filters, resumo, items, meta, loaded, busca, setBusca, statusTab, counts, perPage, categoriasPadrao, visit } = useExtratoList();
    const { pdfLoading, handleGeneratePdf } = useExtratoPdf(filters);

    const [categoriasOpen, setCategoriasOpen] = useState(false);
    const [produtosOpen, setProdutosOpen] = useState(false);
    const [funcionariosOpen, setFuncionariosOpen] = useState(false);
    const [fornecedoresOpen, setFornecedoresOpen] = useState(false);
    const [extratoOpen, setExtratoOpen] = useState(false);
    const [extratoMode, setExtratoMode] = useState<ExtratoModalMode>('create');
    const [parcelaEdit, setParcelaEdit] = useState<ExtratoModalParcela | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [parcelaToDelete, setParcelaToDelete] = useState<ExtratoParcela | null>(null);
    const [deleting, setDeleting] = useState(false);

    function openCreate(): void {
        setExtratoMode('create');
        setParcelaEdit(null);
        setExtratoOpen(true);
    }

    function openEdit(parcela: ExtratoParcela): void {
        setExtratoMode('edit');
        setParcelaEdit(toModalParcela(parcela));
        setExtratoOpen(true);
    }

    function openDelete(parcela: ExtratoParcela): void {
        setParcelaToDelete(parcela);
        setConfirmDeleteOpen(true);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Extrato" />
            <div className="flex h-full w-full max-w-full min-w-0 flex-1 flex-col gap-2 overflow-x-hidden rounded-xl p-4 pb-28 md:gap-4 md:pb-4">
                <CategoriasModal open={categoriasOpen} onOpenChange={setCategoriasOpen} />
                <ProdutosModal open={produtosOpen} onOpenChange={setProdutosOpen} />
                <FuncionariosModal open={funcionariosOpen} onOpenChange={setFuncionariosOpen} />
                <FornecedoresModal open={fornecedoresOpen} onOpenChange={setFornecedoresOpen} />
                <PageTitle
                    title="Extrato Financeiro de Contas"
                    mobileTitle="Extrato"
                    subtitle="Visualize e gerencie os lançamentos da sua conta"
                    actions={
                        <ExtratoPageActions
                            pdfLoading={pdfLoading}
                            onGerarPdf={handleGeneratePdf}
                            onNovoLancamento={openCreate}
                            onOpenCategorias={() => setCategoriasOpen(true)}
                            onOpenProdutos={() => setProdutosOpen(true)}
                            onOpenFuncionarios={() => setFuncionariosOpen(true)}
                            onOpenFornecedores={() => setFornecedoresOpen(true)}
                        />
                    }
                />
                <ExtratoFab2
                    onNovoLancamento={openCreate}
                    onCadastrarFuncionario={() => setFuncionariosOpen(true)}
                    onCadastrarProduto={() => setProdutosOpen(true)}
                    onGerarPdf={handleGeneratePdf}
                />
                <ExtratoModal
                    open={extratoOpen}
                    onOpenChange={setExtratoOpen}
                    mode={extratoMode}
                    parcela={parcelaEdit}
                    categoriasPadrao={categoriasPadrao ?? null}
                />
                <ConfirmDeleteModal
                    open={confirmDeleteOpen}
                    onOpenChange={setConfirmDeleteOpen}
                    title="Excluir parcela"
                    description={`Deseja excluir a parcela "${parcelaToDelete?.descricao ?? ''}"? Esta ação não pode ser desfeita.`}
                    processing={deleting}
                    onConfirm={() => {
                        if (!parcelaToDelete?.id) {
                            return;
                        }
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
                <ExtratoKpis resumo={resumo} />
                <ExtratoTable
                    loaded={loaded}
                    items={items}
                    busca={busca}
                    onBuscaChange={setBusca}
                    status={statusTab}
                    onStatusChange={(status) => visit({ status, page: 1 })}
                    counts={counts}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    meta={meta}
                    perPage={perPage}
                    onPageChange={(page) => visit({ page })}
                    onPerPageChange={(nextPerPage) => visit({ per_page: nextPerPage, page: 1 })}
                    sort={String(filters.sort ?? '')}
                    sortDir={String(filters.sort_dir ?? 'desc')}
                    onSort={(column, direction) => visit({ sort: column, sort_dir: direction, page: 1 })}
                />
            </div>
        </AppLayout>
    );
}
