import EmpresaModulosForm from '@/components/empresas/EmpresaModulosForm';
import EmpresasCard from '@/components/empresas/EmpresasCard';
import EmpresasEmpty from '@/components/empresas/EmpresasEmpty';
import EmpresasFiltros from '@/components/empresas/EmpresasFiltros';
import EmpresasTable from '@/components/empresas/EmpresasTable';
import type { EmpresaAdmin, EmpresasFilters } from '@/components/empresas/types';
import { PageTitle } from '@/components/padrões';
import type { ModuloOpcional, Segmento } from '@/components/segmentos/types';
import UsuariosConfirm from '@/components/usuarios/UsuariosConfirm';
import UsuariosSkeleton from '@/components/usuarios/UsuariosSkeleton';
import AdminLayout from '@/layouts/admin-layout';
import { Deferred, Head, router } from '@inertiajs/react';
import { useState } from 'react';

type Props = {
    filters: EmpresasFilters;
    urls: { index: string };
    segmentos: Segmento[];
    modulos_opcionais: ModuloOpcional[];
    empresas?: EmpresaAdmin[];
};

export default function EmpresasIndex({ filters, urls, segmentos, modulos_opcionais, empresas }: Props) {
    const [emAjuste, setEmAjuste] = useState<EmpresaAdmin | null>(null);
    const [entrarComo, setEntrarComo] = useState<EmpresaAdmin | null>(null);
    const [processando, setProcessando] = useState(false);

    function filtrar(filtros: EmpresasFilters): void {
        const consulta = Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor !== null && valor !== ''));

        router.get(urls.index, consulta, { preserveState: true, preserveScroll: true, replace: true, only: ['empresas', 'filters'] });
    }

    function confirmarEntrarComo(): void {
        if (!entrarComo?.urls.entrar_como) {
            return;
        }

        router.post(
            entrarComo.urls.entrar_como,
            {},
            {
                onStart: () => setProcessando(true),
                onFinish: () => {
                    setProcessando(false);
                    setEntrarComo(null);
                },
            },
        );
    }

    const acoes = { catalogo: modulos_opcionais, onAjustar: setEmAjuste, onEntrarComo: setEntrarComo };

    return (
        <AdminLayout>
            <Head title="Empresas" />

            <div className="flex h-full w-full min-w-0 flex-1 flex-col gap-4 p-4">
                <PageTitle title="Empresas" subtitle="Segmento e módulos de cada cliente" />

                <EmpresasFiltros filtros={filters} segmentos={segmentos} onFiltrar={filtrar} />

                <Deferred data="empresas" fallback={<UsuariosSkeleton />}>
                    {empresas && empresas.length > 0 ? (
                        <>
                            <div className="hidden md:block">
                                <EmpresasTable empresas={empresas} {...acoes} />
                            </div>
                            <div className="flex flex-col gap-3 md:hidden">
                                {empresas.map((empresa) => (
                                    <EmpresasCard key={empresa.id} empresa={empresa} {...acoes} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <EmpresasEmpty filtrando={filters.busca !== null || filters.segmento_id !== null} />
                    )}
                </Deferred>
            </div>

            <EmpresaModulosForm
                open={emAjuste !== null}
                onOpenChange={(open) => !open && setEmAjuste(null)}
                empresa={emAjuste}
                segmentos={segmentos}
                catalogo={modulos_opcionais}
            />

            <UsuariosConfirm
                open={entrarComo !== null}
                onOpenChange={(open) => !open && setEntrarComo(null)}
                titulo="Entrar como admin master"
                descricao={
                    <>
                        Você sairá da sua sessão de administrador e entrará como <strong>{entrarComo?.admin_master?.name}</strong> (
                        {entrarComo?.admin_master?.email}). Para voltar, saia e entre novamente.
                    </>
                }
                textoConfirmar="Entrar como"
                variante="default"
                processing={processando}
                onConfirmar={confirmarEntrarComo}
            />
        </AdminLayout>
    );
}
