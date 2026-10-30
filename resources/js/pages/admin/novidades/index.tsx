import ConfirmDeleteModal from '@/components/extrato/ConfirmDeleteModal';
import NovidadesDispensasModal from '@/components/novidades/NovidadesDispensasModal';
import NovidadesForm from '@/components/novidades/NovidadesForm';
import NovidadesImagensModal from '@/components/novidades/NovidadesImagensModal';
import NovidadesTable from '@/components/novidades/NovidadesTable';
import type { ImagemDoDiretorio, Novidade, NovidadesUrls, UsuarioDispensa } from '@/components/novidades/types';
import { MobileFab, PageTitle } from '@/components/padrões';
import { Button } from '@/components/ui/button';
import UsuariosConfirm from '@/components/usuarios/UsuariosConfirm';
import AdminLayout from '@/layouts/admin-layout';
import { Deferred, Head, router } from '@inertiajs/react';
import { Images, Megaphone, Plus } from 'lucide-react';
import { useState } from 'react';

type Props = {
    urls: NovidadesUrls;
    novidades?: Novidade[];
    imagens?: ImagemDoDiretorio[];
    dispensas?: UsuarioDispensa[];
};

export default function NovidadesIndex({ urls, novidades, imagens, dispensas }: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [imagensOpen, setImagensOpen] = useState(false);
    const [novidadeEmEdicao, setNovidadeEmEdicao] = useState<Novidade | null>(null);
    const [novidadeParaExcluir, setNovidadeParaExcluir] = useState<Novidade | null>(null);
    const [excluindo, setExcluindo] = useState(false);
    const [novidadeDasDispensas, setNovidadeDasDispensas] = useState<Novidade | null>(null);
    const [novidadeParaRelancar, setNovidadeParaRelancar] = useState<Novidade | null>(null);
    const [relancando, setRelancando] = useState(false);

    function abrirCriacao(): void {
        setNovidadeEmEdicao(null);
        setFormOpen(true);
    }

    function abrirEdicao(novidade: Novidade): void {
        setNovidadeEmEdicao(novidade);
        setFormOpen(true);
    }

    function alterarStatus(novidade: Novidade): void {
        router.put(novidade.urls.status, { status: novidade.status === 'publicado' ? 'rascunho' : 'publicado' }, { preserveScroll: true });
    }

    function excluir(): void {
        if (!novidadeParaExcluir) {
            return;
        }

        setExcluindo(true);
        router.delete(novidadeParaExcluir.urls.destroy, {
            preserveScroll: true,
            onSuccess: () => setNovidadeParaExcluir(null),
            onFinish: () => setExcluindo(false),
        });
    }

    function relancar(): void {
        if (!novidadeParaRelancar) {
            return;
        }

        router.post(
            novidadeParaRelancar.urls.relancar,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['novidades', 'dispensas', 'flash'],
                onStart: () => setRelancando(true),
                onSuccess: () => setNovidadeParaRelancar(null),
                onFinish: () => setRelancando(false),
            },
        );
    }

    const acoes = {
        onAdd: abrirCriacao,
        onEdit: abrirEdicao,
        onAlterarStatus: alterarStatus,
        onVerDispensas: setNovidadeDasDispensas,
        onRelancar: setNovidadeParaRelancar,
        onDelete: setNovidadeParaExcluir,
    };

    return (
        <AdminLayout usuariosUrl={urls.usuarios} novidadesUrl={urls.index}>
            <Head title="Novidades" />

            <div className="flex h-full w-full max-w-full min-w-0 flex-1 flex-col gap-2 overflow-x-hidden p-4 pb-28 md:gap-4 md:pb-4">
                <PageTitle
                    title="Novidades"
                    subtitle="Avise os usuários sobre o que mudou no sistema"
                    actions={
                        <div className="hidden items-center gap-2 md:flex">
                            <Button variant="outline" className="inline-flex items-center gap-2" onClick={() => setImagensOpen(true)}>
                                <Images className="h-4 w-4" />
                                Imagens
                            </Button>
                            <Button variant="primary" className="inline-flex items-center gap-2" onClick={abrirCriacao}>
                                <Plus className="h-4 w-4" />
                                Adicionar novidade
                            </Button>
                        </div>
                    }
                />

                <MobileFab
                    actions={[
                        {
                            key: 'nova-novidade',
                            label: '+ Nova Novidade',
                            icon: <Megaphone className="h-4 w-4" />,
                            className: 'bg-blue-600 text-white hover:bg-blue-700',
                            onClick: abrirCriacao,
                        },
                        {
                            key: 'imagens',
                            label: 'Imagens',
                            icon: <Images className="h-4 w-4" />,
                            onClick: () => setImagensOpen(true),
                        },
                    ]}
                />

                <Deferred data="novidades" fallback={<NovidadesTable loaded={false} items={[]} {...acoes} />}>
                    <NovidadesTable loaded={novidades !== undefined} items={novidades ?? []} {...acoes} />
                </Deferred>
            </div>

            <NovidadesForm open={formOpen} onOpenChange={setFormOpen} novidade={novidadeEmEdicao} storeUrl={urls.store} />
            <NovidadesImagensModal open={imagensOpen} onOpenChange={setImagensOpen} imagens={imagens} />
            <NovidadesDispensasModal
                novidade={novidadeDasDispensas}
                onOpenChange={(open) => {
                    if (!open) {
                        setNovidadeDasDispensas(null);
                    }
                }}
                dispensas={dispensas}
                onRelancar={setNovidadeParaRelancar}
            />
            <UsuariosConfirm
                open={novidadeParaRelancar !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setNovidadeParaRelancar(null);
                    }
                }}
                titulo="Relançar novidade"
                descricao={`"${novidadeParaRelancar?.titulo ?? ''}" volta a abrir para todos os usuários, inclusive quem já dispensou, e sobe para o topo do histórico com a data de hoje.`}
                textoConfirmar="Relançar"
                variante="default"
                processing={relancando}
                onConfirmar={relancar}
            />
            <ConfirmDeleteModal
                open={novidadeParaExcluir !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setNovidadeParaExcluir(null);
                    }
                }}
                title="Excluir novidade"
                description={`A novidade "${novidadeParaExcluir?.titulo ?? ''}" sai do histórico de todos os usuários. Esta ação não pode ser desfeita.`}
                processing={excluindo}
                onConfirm={excluir}
            />
        </AdminLayout>
    );
}
