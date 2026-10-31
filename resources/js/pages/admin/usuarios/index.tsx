import { PageTitle } from '@/components/padrões';
import { Button } from '@/components/ui/button';
import type { Usuario, UsuariosFilters, UsuariosUrls } from '@/components/usuarios/types';
import UsuariosBusca from '@/components/usuarios/UsuariosBusca';
import UsuariosCard from '@/components/usuarios/UsuariosCard';
import UsuariosConfirm from '@/components/usuarios/UsuariosConfirm';
import UsuariosEmpty from '@/components/usuarios/UsuariosEmpty';
import UsuariosForm from '@/components/usuarios/UsuariosForm';
import UsuariosSkeleton from '@/components/usuarios/UsuariosSkeleton';
import UsuariosTable from '@/components/usuarios/UsuariosTable';
import UsuariosTransferModal from '@/components/usuarios/UsuariosTransferModal';
import AdminLayout from '@/layouts/admin-layout';
import { Deferred, Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

type Props = {
    filters: UsuariosFilters;
    urls: UsuariosUrls;
    usuarios?: Usuario[];
};

type Confirmacao = { tipo: 'excluir' | 'entrar-como'; usuario: Usuario } | null;

export default function UsuariosIndex({ filters, urls, usuarios }: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<Usuario | null>(null);
    const [confirmacao, setConfirmacao] = useState<Confirmacao>(null);
    const [processando, setProcessando] = useState(false);

    function abrirCriacao(): void {
        setFormMode('create');
        setUsuarioEmEdicao(null);
        setFormOpen(true);
    }

    function abrirEdicao(usuario: Usuario): void {
        setFormMode('edit');
        setUsuarioEmEdicao(usuario);
        setFormOpen(true);
    }

    function buscar(busca: string): void {
        router.get(urls.index, busca ? { busca } : {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['usuarios', 'filters'],
        });
    }

    function confirmar(): void {
        if (!confirmacao) {
            return;
        }

        const opcoes = {
            onStart: () => setProcessando(true),
            onFinish: () => {
                setProcessando(false);
                setConfirmacao(null);
            },
        };

        if (confirmacao.tipo === 'excluir') {
            router.delete(confirmacao.usuario.urls.destroy, { ...opcoes, preserveScroll: true });
            return;
        }

        router.post(confirmacao.usuario.urls.entrar_como, {}, opcoes);
    }

    const acoes = {
        onEditar: abrirEdicao,
        onEntrarComo: (usuario: Usuario) => setConfirmacao({ tipo: 'entrar-como', usuario }),
        onExcluir: (usuario: Usuario) => setConfirmacao({ tipo: 'excluir', usuario }),
    };

    return (
        <AdminLayout>
            <Head title="Painel Administrativo" />

            <div className="flex h-full w-full min-w-0 flex-1 flex-col gap-4 p-4">
                <PageTitle
                    title="Usuários"
                    subtitle="Gerencie os usuários do sistema"
                    actions={
                        <div className="flex items-center gap-2">
                            <Button variant="primary" onClick={abrirCriacao} className="inline-flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Adicionar usuário
                            </Button>
                            <Button variant="default" onClick={() => setTransferOpen(true)} className="inline-flex items-center gap-2">
                                Transferir Dados
                            </Button>
                        </div>
                    }
                />

                <UsuariosBusca busca={filters.busca} onBuscar={buscar} />

                <Deferred data="usuarios" fallback={<UsuariosSkeleton />}>
                    {usuarios && usuarios.length > 0 ? (
                        <>
                            <div className="hidden md:block">
                                <UsuariosTable usuarios={usuarios} {...acoes} />
                            </div>
                            <div className="flex flex-col gap-3 md:hidden">
                                {usuarios.map((usuario) => (
                                    <UsuariosCard key={usuario.id} usuario={usuario} {...acoes} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <UsuariosEmpty busca={filters.busca} onAdd={abrirCriacao} />
                    )}
                </Deferred>
            </div>

            <UsuariosForm open={formOpen} onOpenChange={setFormOpen} mode={formMode} usuario={usuarioEmEdicao} storeUrl={urls.store} />
            <UsuariosTransferModal open={transferOpen} onOpenChange={setTransferOpen} urls={urls} />

            <UsuariosConfirm
                open={confirmacao !== null}
                onOpenChange={(open) => !open && setConfirmacao(null)}
                titulo={confirmacao?.tipo === 'excluir' ? 'Excluir usuário' : 'Entrar como usuário'}
                descricao={
                    confirmacao?.tipo === 'excluir' ? (
                        <>
                            Excluir <strong>{confirmacao.usuario.name}</strong> ({confirmacao.usuario.email}) apaga também todos os dados financeiros
                            dele. Esta ação não pode ser desfeita.
                        </>
                    ) : (
                        <>
                            Você sairá da sua sessão de administrador e entrará como <strong>{confirmacao?.usuario.name}</strong> (
                            {confirmacao?.usuario.email}). Para voltar, saia e entre novamente.
                        </>
                    )
                }
                textoConfirmar={confirmacao?.tipo === 'excluir' ? 'Excluir' : 'Entrar como'}
                variante={confirmacao?.tipo === 'excluir' ? 'destructive' : 'default'}
                processing={processando}
                onConfirmar={confirmar}
            />
        </AdminLayout>
    );
}
