import DashboardGrafico from '@/components/dashboard/DashboardGrafico';
import DashboardPizza from '@/components/dashboard/DashboardPizza';
import DashboardPizzaSkeleton from '@/components/dashboard/DashboardPizzaSkeleton';
import DashboardReceitas from '@/components/dashboard/DashboardReceitas';
import DashboardReceitasSkeleton from '@/components/dashboard/DashboardReceitasSkeleton';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import { type DashboardPageProps, type FatiaPizza } from '@/components/dashboard/types';
import { PageTitle } from '@/components/padrões';
import { useSidebar } from '@/components/ui/sidebar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Deferred, Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const CARD_WRAP =
    'flex min-h-0 w-full max-w-full shrink-0 grow-0 flex-col @min-[36rem]:w-[calc((100%-1rem)/2)] @min-[54rem]:w-[calc((100%-2rem)/3)] [&>*]:h-full';

function RecolherSidebarNoDashboard(): null {
    const { setOpen } = useSidebar();

    useEffect(() => {
        const preferencia = window.localStorage.getItem('sidebar');

        setOpen(false);

        if (preferencia === null) {
            window.localStorage.removeItem('sidebar');
        } else {
            window.localStorage.setItem('sidebar', preferencia);
        }
    }, [setOpen]);

    return null;
}

function fatiasDeCategoria(despesas: DashboardPageProps['despesasPorCategoria']): FatiaPizza[] {
    return (despesas ?? []).map((item) => ({ rotulo: item.categoria, valor: item.valor }));
}

function fatiasDeGrupo(despesas: DashboardPageProps['despesasPorGrupoDeProduto']): FatiaPizza[] {
    return (despesas ?? []).map((item) => ({ rotulo: item.grupo, valor: item.valor }));
}

export default function Dashboard({
    ano,
    saldos,
    dataInicioDespesasPorCategoria,
    dataFimDespesasPorCategoria,
    despesasPorCategoria,
    dataInicioDespesasPorGrupo,
    dataFimDespesasPorGrupo,
    despesasPorGrupoDeProduto,
    mesReceitas,
    semanaReceitas,
    semanasReceitas,
    receitasPorDiaDaSemana,
}: DashboardPageProps) {
    const [dataInicio, setDataInicio] = useState<string>(dataInicioDespesasPorCategoria);
    const [dataFim, setDataFim] = useState<string>(dataFimDespesasPorCategoria);
    const [grupoInicio, setGrupoInicio] = useState<string>(dataInicioDespesasPorGrupo);
    const [grupoFim, setGrupoFim] = useState<string>(dataFimDespesasPorGrupo);
    const [mes, setMes] = useState<string>(mesReceitas);
    const [semana, setSemana] = useState<string>(semanaReceitas);

    function queryDashboard(overrides: Record<string, string> = {}): Record<string, string> {
        return {
            data_inicio: dataInicio,
            data_fim: dataFim,
            grupo_data_inicio: grupoInicio,
            grupo_data_fim: grupoFim,
            mes_receitas: mes,
            semana_receitas: semana,
            ...overrides,
        };
    }

    function recarregarPizza(inicio: string, fim: string): void {
        setDataInicio(inicio);
        setDataFim(fim);
        router.get(route('dashboard'), queryDashboard({ data_inicio: inicio, data_fim: fim }), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            only: ['despesasPorCategoria'],
        });
    }

    function recarregarPizzaGrupos(inicio: string, fim: string): void {
        setGrupoInicio(inicio);
        setGrupoFim(fim);
        router.get(
            route('dashboard'),
            queryDashboard({ grupo_data_inicio: inicio, grupo_data_fim: fim }),
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                only: ['despesasPorGrupoDeProduto'],
            },
        );
    }

    function recarregarReceitas(proximoMes: string, proximaSemana: string | null): void {
        setMes(proximoMes);

        const payload =
            proximaSemana === null
                ? queryDashboard({ mes_receitas: proximoMes, semana_receitas: '' })
                : queryDashboard({ mes_receitas: proximoMes, semana_receitas: proximaSemana });

        if (proximaSemana === null) {
            delete payload.semana_receitas;
        } else {
            setSemana(proximaSemana);
        }

        router.get(route('dashboard'), payload, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            only: ['receitasPorDiaDaSemana', 'semanasReceitas', 'mesReceitas', 'semanaReceitas'],
            onSuccess: (page) => {
                const mesAtualizado = page.props.mesReceitas;
                const semanaAtualizada = page.props.semanaReceitas;

                if (typeof mesAtualizado !== 'string' || typeof semanaAtualizada !== 'string') {
                    return;
                }

                setMes(mesAtualizado);
                setSemana(semanaAtualizada);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <RecolherSidebarNoDashboard />
            <Head title="Dashboard" />
            <div className="flex h-full min-w-0 flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                <PageTitle title="Saldo mensal" subtitle={String(ano)} />

                <div className="@container flex min-w-0 flex-wrap items-stretch gap-4">
                    <div className={CARD_WRAP}>
                        <Deferred data="saldos" fallback={<DashboardSkeleton />}>
                            <DashboardGrafico ano={ano} saldos={saldos ?? []} />
                        </Deferred>
                    </div>

                    <div className={CARD_WRAP}>
                        <Deferred
                            data="despesasPorCategoria"
                            fallback={
                                <DashboardPizzaSkeleton
                                    titulo="Despesas por categoria"
                                    dataInicio={dataInicio}
                                    dataFim={dataFim}
                                    onPeriodoChange={recarregarPizza}
                                />
                            }
                        >
                            <DashboardPizza
                                titulo="Despesas por categoria"
                                fatias={fatiasDeCategoria(despesasPorCategoria)}
                                dataInicio={dataInicio}
                                dataFim={dataFim}
                                onPeriodoChange={recarregarPizza}
                            />
                        </Deferred>
                    </div>

                    <div className={CARD_WRAP}>
                        <Deferred
                            data="despesasPorGrupoDeProduto"
                            fallback={
                                <DashboardPizzaSkeleton
                                    titulo="Por grupo de produtos"
                                    dataInicio={grupoInicio}
                                    dataFim={grupoFim}
                                    onPeriodoChange={recarregarPizzaGrupos}
                                />
                            }
                        >
                            <DashboardPizza
                                titulo="Por grupo de produtos"
                                fatias={fatiasDeGrupo(despesasPorGrupoDeProduto)}
                                dataInicio={grupoInicio}
                                dataFim={grupoFim}
                                onPeriodoChange={recarregarPizzaGrupos}
                            />
                        </Deferred>
                    </div>

                    <div className={CARD_WRAP}>
                        <Deferred data="receitasPorDiaDaSemana" fallback={<DashboardReceitasSkeleton />}>
                            <DashboardReceitas
                                ano={ano}
                                mes={mes}
                                semana={semana}
                                semanas={semanasReceitas}
                                receitas={receitasPorDiaDaSemana ?? []}
                                onFiltroChange={recarregarReceitas}
                            />
                        </Deferred>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
