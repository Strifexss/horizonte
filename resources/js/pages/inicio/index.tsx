import InicioAcoes from '@/components/inicio/InicioAcoes';
import InicioPrimeirosPassos from '@/components/inicio/InicioPrimeirosPassos';
import InicioResumo from '@/components/inicio/InicioResumo';
import InicioUltimosLancamentos from '@/components/inicio/InicioUltimosLancamentos';
import type { InicioPageProps } from '@/components/inicio/types';
import { PageTitle } from '@/components/padrões';
import { useSidebar } from '@/components/ui/sidebar';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Deferred, Head, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Início', href: '/inicio' }];

function ExpandirSidebarNoInicio(): null {
    const { setOpen } = useSidebar();
    const jaExpandiu = useRef(false);

    useEffect(() => {
        if (jaExpandiu.current) {
            return;
        }

        jaExpandiu.current = true;
        setOpen(true);
    }, [setOpen]);

    return null;
}

function saudacao(hora: number): string {
    if (hora < 12) {
        return 'Bom dia';
    }

    return hora < 18 ? 'Boa tarde' : 'Boa noite';
}

function hojePorExtenso(agora: Date): string {
    const texto = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(agora);

    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function Inicio({ primeirosPassos, resumo, ultimosLancamentos }: InicioPageProps) {
    const { auth, empresa } = usePage<SharedData>().props;
    const agora = new Date();
    const primeiroNome = auth.user.name.trim().split(/\s+/)[0];
    const mostrarPassos = primeirosPassos.some((passo) => !passo.feito);
    const subtitulo = [hojePorExtenso(agora), empresa?.nome].filter(Boolean).join(' · ');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <ExpandirSidebarNoInicio />
            <Head title="Início" />
            <div className="flex h-full w-full max-w-full min-w-0 flex-1 flex-col gap-6 overflow-x-hidden rounded-xl p-4 md:gap-8">
                <PageTitle title={`${saudacao(agora.getHours())}, ${primeiroNome}`} subtitle={subtitulo} />

                <InicioAcoes />

                <div className={cn('flex flex-col gap-6', mostrarPassos && 'lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start')}>
                    {mostrarPassos ? (
                        <div className="lg:col-start-2 lg:row-start-1">
                            <InicioPrimeirosPassos passos={primeirosPassos} />
                        </div>
                    ) : null}

                    <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1">
                        <Deferred data="resumo" fallback={<InicioResumo />}>
                            <InicioResumo resumo={resumo} />
                        </Deferred>
                        <Deferred data="ultimosLancamentos" fallback={<InicioUltimosLancamentos />}>
                            <InicioUltimosLancamentos lancamentos={ultimosLancamentos} />
                        </Deferred>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
