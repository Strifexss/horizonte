import DashboardGrafico from '@/components/dashboard/DashboardGrafico';
import DashboardPizza from '@/components/dashboard/DashboardPizza';
import DashboardPizzaSkeleton from '@/components/dashboard/DashboardPizzaSkeleton';
import DashboardRanking from '@/components/dashboard/DashboardRanking';
import DashboardRankingSkeleton from '@/components/dashboard/DashboardRankingSkeleton';
import DashboardReceitas from '@/components/dashboard/DashboardReceitas';
import DashboardReceitasSkeleton from '@/components/dashboard/DashboardReceitasSkeleton';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import { type CriterioRanking, type DashboardPageProps, type FatiaPizza, type PontoMensal, type SeriesMensais } from '@/components/dashboard/types';
import ExtratoKpis, { ExtratoKpisSkeleton } from '@/components/extrato/ExtratoKpis';
import { PageTitle } from '@/components/padrões';
import { useSidebar } from '@/components/ui/sidebar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Deferred, Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const COR_RECEITA = '#082845';
const COR_DESPESA = '#f59e0b';

const CARD_WRAP =
    'flex min-h-0 w-full max-w-full shrink-0 grow-0 flex-col @min-[36rem]:w-[calc((100%-1rem)/2)] @min-[54rem]:w-[calc((100%-2rem)/3)] [&>*]:h-full';

const CARD_WRAP_DUPLO = 'flex min-h-0 w-full max-w-full shrink-0 grow-0 flex-col @min-[54rem]:w-[calc((100%-2rem)/3*2+1rem)] [&>*]:h-full';

function pontosDeSaldo(saldos: SeriesMensais['saldos'] | undefined): PontoMensal[] {
    return (saldos ?? []).map((ponto) => ({
        mes: ponto.mes,
        rotulo: ponto.rotulo,
        valor: ponto.saldo,
    }));
}

function RecolherSidebarNoDashboard(): null {
    const { setOpen } = useSidebar();
    const jaRecolheu = useRef(false);

    useEffect(() => {
        if (jaRecolheu.current) {
            return;
        }

        jaRecolheu.current = true;
        setOpen(false);
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
    resumo,
    seriesMensais,
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
    rankingCriterio,
    dataInicioRanking,
    dataFimRanking,
    ranking,
}: DashboardPageProps) {
    const [dataInicio, setDataInicio] = useState<string>(dataInicioDespesasPorCategoria);
    const [dataFim, setDataFim] = useState<string>(dataFimDespesasPorCategoria);
    const [grupoInicio, setGrupoInicio] = useState<string>(dataInicioDespesasPorGrupo);
    const [grupoFim, setGrupoFim] = useState<string>(dataFimDespesasPorGrupo);
    const [mes, setMes] = useState<string>(mesReceitas);
    const [semana, setSemana] = useState<string>(semanaReceitas);
    const [criterioRanking, setCriterioRanking] = useState<CriterioRanking>(rankingCriterio);
    const [rankingInicio, setRankingInicio] = useState<string>(dataInicioRanking);
    const [rankingFim, setRankingFim] = useState<string>(dataFimRanking);

    function queryDashboard(overrides: Record<string, string> = {}): Record<string, string> {
        return {
            data_inicio: dataInicio,
            data_fim: dataFim,
            grupo_data_inicio: grupoInicio,
            grupo_data_fim: grupoFim,
            mes_receitas: mes,
            semana_receitas: semana,
            ranking_criterio: criterioRanking,
            ranking_data_inicio: rankingInicio,
            ranking_data_fim: rankingFim,
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
        router.get(route('dashboard'), queryDashboard({ grupo_data_inicio: inicio, grupo_data_fim: fim }), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            only: ['despesasPorGrupoDeProduto'],
        });
    }

    function recarregarRanking(overrides: Record<string, string>): void {
        router.get(route('dashboard'), queryDashboard(overrides), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            only: ['ranking'],
        });
    }

    function trocarCriterioRanking(criterio: CriterioRanking): void {
        setCriterioRanking(criterio);
        recarregarRanking({ ranking_criterio: criterio });
    }

    function trocarPeriodoRanking(inicio: string, fim: string): void {
        setRankingInicio(inicio);
        setRankingFim(fim);
        recarregarRanking({ ranking_data_inicio: inicio, ranking_data_fim: fim });
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
                <PageTitle title="Dashboard" />

                <Deferred data="resumo" fallback={<ExtratoKpisSkeleton omitirSaldoAnterior empilharNoMobile />}>
                    <ExtratoKpis resumo={resumo} omitirSaldoAnterior empilharNoMobile />
                </Deferred>

                <div className="@container flex min-w-0 flex-wrap items-stretch gap-4">
                    <div className={CARD_WRAP_DUPLO}>
                        <Deferred
                            data="ranking"
                            fallback={
                                <DashboardRankingSkeleton
                                    criterio={criterioRanking}
                                    onCriterioChange={trocarCriterioRanking}
                                    dataInicio={rankingInicio}
                                    dataFim={rankingFim}
                                    onPeriodoChange={trocarPeriodoRanking}
                                />
                            }
                        >
                            <DashboardRanking
                                criterio={criterioRanking}
                                onCriterioChange={trocarCriterioRanking}
                                itens={ranking?.itens ?? []}
                                dataInicio={rankingInicio}
                                dataFim={rankingFim}
                                onPeriodoChange={trocarPeriodoRanking}
                            />
                        </Deferred>
                    </div>

                    <div className={CARD_WRAP}>
                        <Deferred data="seriesMensais" fallback={<DashboardSkeleton titulo="Saldo mensal" />}>
                            <DashboardGrafico
                                ano={ano}
                                titulo="Saldo mensal"
                                pontos={pontosDeSaldo(seriesMensais?.saldos)}
                                cor="#16a34a"
                                corPorSinal
                                mensagemVazio="Sem lançamentos no ano."
                            />
                        </Deferred>
                    </div>

                    <div className={CARD_WRAP}>
                        <Deferred data="seriesMensais" fallback={<DashboardSkeleton titulo="Receitas por mês" />}>
                            <DashboardGrafico
                                ano={ano}
                                titulo="Receitas por mês"
                                pontos={seriesMensais?.receitas ?? []}
                                cor={COR_RECEITA}
                                mensagemVazio="Sem receitas no ano."
                            />
                        </Deferred>
                    </div>

                    <div className={CARD_WRAP}>
                        <Deferred data="seriesMensais" fallback={<DashboardSkeleton titulo="Despesas por mês" />}>
                            <DashboardGrafico
                                ano={ano}
                                titulo="Despesas por mês"
                                pontos={seriesMensais?.despesas ?? []}
                                cor={COR_DESPESA}
                                mensagemVazio="Sem despesas no ano."
                            />
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
                                    idPrefix="categoria-"
                                />
                            }
                        >
                            <DashboardPizza
                                titulo="Despesas por categoria"
                                fatias={fatiasDeCategoria(despesasPorCategoria)}
                                dataInicio={dataInicio}
                                dataFim={dataFim}
                                onPeriodoChange={recarregarPizza}
                                idPrefix="categoria-"
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
                                    idPrefix="grupo-"
                                />
                            }
                        >
                            <DashboardPizza
                                titulo="Por grupo de produtos"
                                fatias={fatiasDeGrupo(despesasPorGrupoDeProduto)}
                                dataInicio={grupoInicio}
                                dataFim={grupoFim}
                                onPeriodoChange={recarregarPizzaGrupos}
                                idPrefix="grupo-"
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
