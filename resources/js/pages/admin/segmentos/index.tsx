import { PageTitle } from '@/components/padrões';
import SegmentosCard from '@/components/segmentos/SegmentosCard';
import SegmentosEmpty from '@/components/segmentos/SegmentosEmpty';
import SegmentosForm from '@/components/segmentos/SegmentosForm';
import SegmentosTable from '@/components/segmentos/SegmentosTable';
import type { ModuloOpcional, Segmento } from '@/components/segmentos/types';
import { Button } from '@/components/ui/button';
import UsuariosConfirm from '@/components/usuarios/UsuariosConfirm';
import UsuariosSkeleton from '@/components/usuarios/UsuariosSkeleton';
import AdminLayout from '@/layouts/admin-layout';
import { Deferred, Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

type Props = {
    urls: { store: string };
    modulos_opcionais: ModuloOpcional[];
    modulos_obrigatorios: string[];
    segmentos?: Segmento[];
};

export default function SegmentosIndex({ urls, modulos_opcionais, modulos_obrigatorios, segmentos }: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [emEdicao, setEmEdicao] = useState<Segmento | null>(null);
    const [paraExcluir, setParaExcluir] = useState<Segmento | null>(null);
    const [processando, setProcessando] = useState(false);

    function abrirCriacao(): void {
        setEmEdicao(null);
        setFormOpen(true);
    }

    function abrirEdicao(segmento: Segmento): void {
        setEmEdicao(segmento);
        setFormOpen(true);
    }

    function excluir(): void {
        if (!paraExcluir?.urls) {
            return;
        }

        router.delete(paraExcluir.urls.destroy, {
            preserveScroll: true,
            onStart: () => setProcessando(true),
            onFinish: () => {
                setProcessando(false);
                setParaExcluir(null);
            },
        });
    }

    const acoes = { catalogo: modulos_opcionais, onEditar: abrirEdicao, onExcluir: setParaExcluir };

    return (
        <AdminLayout>
            <Head title="Segmentos" />

            <div className="flex h-full w-full min-w-0 flex-1 flex-col gap-4 p-4">
                <PageTitle
                    title="Segmentos"
                    subtitle="Ramos de negócio e os módulos que cada um inclui"
                    actions={
                        <Button variant="primary" onClick={abrirCriacao} className="inline-flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Adicionar segmento
                        </Button>
                    }
                />

                <Deferred data="segmentos" fallback={<UsuariosSkeleton />}>
                    {segmentos && segmentos.length > 0 ? (
                        <>
                            <div className="hidden md:block">
                                <SegmentosTable segmentos={segmentos} {...acoes} />
                            </div>
                            <div className="flex flex-col gap-3 md:hidden">
                                {segmentos.map((segmento) => (
                                    <SegmentosCard key={segmento.id} segmento={segmento} {...acoes} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <SegmentosEmpty onAdd={abrirCriacao} />
                    )}
                </Deferred>
            </div>

            <SegmentosForm
                open={formOpen}
                onOpenChange={setFormOpen}
                segmento={emEdicao}
                storeUrl={urls.store}
                catalogo={modulos_opcionais}
                obrigatorios={modulos_obrigatorios}
            />

            <UsuariosConfirm
                open={paraExcluir !== null}
                onOpenChange={(open) => !open && setParaExcluir(null)}
                titulo="Excluir segmento"
                descricao={
                    <>
                        Excluir <strong>{paraExcluir?.nome}</strong>? Só é possível quando nenhuma empresa está nele.
                    </>
                }
                textoConfirmar="Excluir"
                variante="destructive"
                processing={processando}
                onConfirmar={excluir}
            />
        </AdminLayout>
    );
}
