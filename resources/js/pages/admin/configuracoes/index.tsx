import ConfiguracoesListaCopiloto, { formatarData } from '@/components/configuracoes/ConfiguracoesListaCopiloto';
import ConfiguracoesSuporteForm from '@/components/configuracoes/ConfiguracoesSuporteForm';
import type { InteresseModulo, PerguntaSemResposta } from '@/components/configuracoes/types';
import { PageTitle } from '@/components/padrões';
import UsuariosSkeleton from '@/components/usuarios/UsuariosSkeleton';
import AdminLayout from '@/layouts/admin-layout';
import { Deferred, Head } from '@inertiajs/react';

type Props = {
    urls: { update: string };
    configuracoes: { suporte_whatsapp: string | null };
    perguntas_sem_resposta?: PerguntaSemResposta[];
    interesses?: InteresseModulo[];
};

export default function ConfiguracoesIndex({ urls, configuracoes, perguntas_sem_resposta, interesses }: Props) {
    return (
        <AdminLayout>
            <Head title="Configurações" />

            <div className="flex h-full w-full min-w-0 flex-1 flex-col gap-4 p-4">
                <PageTitle title="Configurações" subtitle="Ajustes gerais do Horizonte e o que o Copiloto está aprendendo" />

                <ConfiguracoesSuporteForm url={urls.update} suporteWhatsapp={configuracoes.suporte_whatsapp} />

                <div className="grid gap-4 lg:grid-cols-2">
                    <Deferred data="perguntas_sem_resposta" fallback={<UsuariosSkeleton />}>
                        <ConfiguracoesListaCopiloto
                            titulo="Perguntas sem resposta"
                            descricao="O que o Copiloto não soube responder. Use para completar a ajuda em resources/ajuda."
                            vazio="Nenhuma pergunta sem resposta."
                            itens={perguntas_sem_resposta ?? []}
                            render={(item) => (
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm">{item.pergunta}</p>
                                    <p className="text-muted-foreground text-xs">
                                        {[item.empresa, item.tela, formatarData(item.created_at)].filter(Boolean).join(' · ')}
                                    </p>
                                </div>
                            )}
                        />
                    </Deferred>

                    <Deferred data="interesses" fallback={<UsuariosSkeleton />}>
                        <ConfiguracoesListaCopiloto
                            titulo="Interesse em módulos"
                            descricao="Quem tocou em “Quero o …” no Copiloto."
                            vazio="Nenhum interesse registrado."
                            itens={interesses ?? []}
                            render={(item) => (
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">{item.modulo}</p>
                                    <p className="text-muted-foreground text-xs">
                                        {[item.empresa, item.usuario, formatarData(item.created_at)].filter(Boolean).join(' · ')}
                                    </p>
                                </div>
                            )}
                        />
                    </Deferred>
                </div>
            </div>
        </AdminLayout>
    );
}
