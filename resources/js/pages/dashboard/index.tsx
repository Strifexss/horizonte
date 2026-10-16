import DashboardGrafico from '@/components/dashboard/DashboardGrafico';
import DashboardPeriodoReferencia from '@/components/dashboard/DashboardPeriodoReferencia';
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

const PROPS_DO_MES = ['mes', 'semana', 'semanas', 'resumo', 'despesasPorCategoria', 'despesasPorGrupoDeProduto', 'receitasPorDiaDaSemana', 'ranking'];

const PROPS_DO_ANO = ['ano', 'seriesMensais', ...PROPS_DO_MES];

export default function Dashboard({
    ano,
    mes,
    anos,
    semana,
    semanas,
    rankingCriterio,
    resumo,
    seriesMensais,
    despesasPorCategoria,
    despesasPorGrupoDeProduto,
    receitasPorDiaDaSemana,
    ranking,
}: DashboardPageProps) {
    const [anoSelecionado, setAnoSelecionado] = useState<number>(ano);
    const [mesSelecionado, setMesSelecionado] = useState<number>(mes);
    const [semanaSelecionada, setSemanaSelecionada] = useState<string>(semana);
    const [criterioRanking, setCriterioRanking] = useState<CriterioRanking>(rankingCriterio);

    function recarregar(query: Record<string, string>, only: string[]): void {
        router.get(route('dashboard'), query, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            only,
            onSuccess: (page) => {
                const semanaDoServidor = page.props.semana;

                if (typeof semanaDoServidor === 'string') {
                    setSemanaSelecionada(semanaDoServidor);
                }
            },
        });
    }

    function trocarPeriodo(proximoAno: number, proximoMes: number): void {
        if (proximoAno === anoSelecionado && proximoMes === mesSelecionado) {
            return;
        }

        setAnoSelecionado(proximoAno);
        setMesSelecionado(proximoMes);
        recarregar(
            { ano: String(proximoAno), mes: String(proximoMes), ranking_criterio: criterioRanking },
            proximoAno === anoSelecionado ? PROPS_DO_MES : PROPS_DO_ANO,
        );
    }

    function trocarSemana(proximaSemana: string): void {
        setSemanaSelecionada(proximaSemana);
        recarregar({ ano: String(anoSelecionado), mes: String(mesSelecionado), semana: proximaSemana, ranking_criterio: criterioRanking }, [
            'semana',
            'receitasPorDiaDaSemana',
        ]);
    }

    function trocarCriterioRanking(criterio: CriterioRanking): void {
        setCriterioRanking(criterio);
        recarregar({ ano: String(anoSelecionado), mes: String(mesSelecionado), semana: semanaSelecionada, ranking_criterio: criterio }, ['ranking']);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <RecolherSidebarNoDashboard />
            <Head title="Dashboard" />
            <div className="flex h-full min-w-0 flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                <PageTitle title="Dashboard" />

                <DashboardPeriodoReferencia ano={anoSelecionado} mes={mesSelecionado} anos={anos} onPeriodoChange={trocarPeriodo} />

                <Deferred data="resumo" fallback={<ExtratoKpisSkeleton empilharNoMobile />}>
                    <ExtratoKpis resumo={resumo} empilharNoMobile />
                </Deferred>

                <div className="@container flex min-w-0 flex-wrap items-stretch gap-4">
                    <div className={CARD_WRAP_DUPLO}>
                        <Deferred
                            data="ranking"
                            fallback={<DashboardRankingSkeleton criterio={criterioRanking} onCriterioChange={trocarCriterioRanking} />}
                        >
                            <DashboardRanking criterio={criterioRanking} onCriterioChange={trocarCriterioRanking} itens={ranking?.itens ?? []} />
                        </Deferred>
                    </div>

                    <div className={CARD_WRAP}>
                        <Deferred data="seriesMensais" fallback={<DashboardSkeleton titulo="Saldo mensal" />}>
                            <DashboardGrafico
                                ano={anoSelecionado}
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
                                ano={anoSelecionado}
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
                                ano={anoSelecionado}
                                titulo="Despesas por mês"
                                pontos={seriesMensais?.despesas ?? []}
                                cor={COR_DESPESA}
                                mensagemVazio="Sem despesas no ano."
                            />
                        </Deferred>
                    </div>

                    <div className={CARD_WRAP}>
                        <Deferred data="despesasPorCategoria" fallback={<DashboardPizzaSkeleton titulo="Despesas por categoria" />}>
                            <DashboardPizza titulo="Despesas por categoria" fatias={fatiasDeCategoria(despesasPorCategoria)} />
                        </Deferred>
                    </div>

                    <div className={CARD_WRAP}>
                        <Deferred data="despesasPorGrupoDeProduto" fallback={<DashboardPizzaSkeleton titulo="Por grupo de produtos" />}>
                            <DashboardPizza titulo="Por grupo de produtos" fatias={fatiasDeGrupo(despesasPorGrupoDeProduto)} />
                        </Deferred>
                    </div>

                    <div className={CARD_WRAP}>
                        <Deferred data="receitasPorDiaDaSemana" fallback={<DashboardReceitasSkeleton />}>
                            <DashboardReceitas
                                semana={semanaSelecionada}
                                semanas={semanas}
                                receitas={receitasPorDiaDaSemana ?? []}
                                onSemanaChange={trocarSemana}
                            />
                        </Deferred>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
