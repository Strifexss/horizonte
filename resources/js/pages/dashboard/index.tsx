import DashboardBloco from '@/components/dashboard/DashboardBloco';
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
import InsightsPainel from '@/components/insights/InsightsPainel';
import { rotuloDoPeriodo, type AcaoInsight, type AnaliseDashboard, type Insight, type MotivoDispensa } from '@/components/insights/types';
import { PageTitle } from '@/components/padrões';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const COR_RECEITA = '#082845';

const INTERVALO_CONSULTA_ANALISE_MS = 20000;
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
    insights,
}: DashboardPageProps) {
    const temCopiloto = usePage<SharedData>().props.empresa?.modulos.includes('copiloto') ?? false;
    const [anoSelecionado, setAnoSelecionado] = useState<number>(ano);
    const [mesSelecionado, setMesSelecionado] = useState<number>(mes);
    const [semanaSelecionada, setSemanaSelecionada] = useState<string>(semana);
    const [criterioRanking, setCriterioRanking] = useState<CriterioRanking>(rankingCriterio);
    const [recarregando, setRecarregando] = useState<string[]>([]);
    const [analiseAberta, setAnaliseAberta] = useState(false);
    const [gerandoAnalise, setGerandoAnalise] = useState(false);
    const [erroAnalise, setErroAnalise] = useState<string | null>(null);
    const [acaoEmAndamento, setAcaoEmAndamento] = useState(false);
    const analiseDoPeriodo = insights && insights.ano === anoSelecionado && insights.mes === mesSelecionado ? insights : null;
    const analiseEmAndamento = analiseDoPeriodo?.status === 'processando';

    useEffect(() => {
        if (!analiseAberta || !analiseEmAndamento) {
            return;
        }

        const consulta = window.setTimeout(() => router.reload({ only: ['insights'] }), INTERVALO_CONSULTA_ANALISE_MS);

        return () => window.clearTimeout(consulta);
    }, [analiseAberta, analiseEmAndamento, insights]);

    function gerarAnalise(forcar: boolean): void {
        setErroAnalise(null);
        router.post(
            route('dashboard.insights.store'),
            { ano: anoSelecionado, mes: mesSelecionado, forcar },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['insights', 'flash'],
                onStart: () => setGerandoAnalise(true),
                onSuccess: (page) => {
                    const flash = page.props.flash as { error?: string | null } | undefined;

                    if (flash?.error) {
                        setErroAnalise(flash.error);
                    }
                },
                onFinish: () => setGerandoAnalise(false),
            },
        );
    }

    function abrirAnalise(): void {
        let precisaGerar = false;

        setAnaliseAberta(true);
        setErroAnalise(null);
        router.reload({
            only: ['insights'],
            onStart: () => setGerandoAnalise(true),
            onSuccess: (page) => {
                const atual = page.props.insights as AnaliseDashboard | null | undefined;
                precisaGerar = !atual || atual.ano !== anoSelecionado || atual.mes !== mesSelecionado;
            },
            onFinish: () => {
                if (precisaGerar) {
                    gerarAnalise(false);
                    return;
                }

                setGerandoAnalise(false);
            },
        });
    }

    function opcoesDeAcao() {
        return {
            preserveScroll: true,
            preserveState: true,
            only: ['insights'],
            onStart: () => setAcaoEmAndamento(true),
            onFinish: () => setAcaoEmAndamento(false),
        };
    }

    function registrarAcao(insight: Insight, acao: AcaoInsight, motivo: MotivoDispensa | null = null): void {
        if (!analiseDoPeriodo) {
            return;
        }

        router.post(route('dashboard.insights.acoes.store', analiseDoPeriodo.id), { chave: insight.chave, acao, motivo }, opcoesDeAcao());
    }

    function desfazerAcao(insight: Insight): void {
        if (!analiseDoPeriodo) {
            return;
        }

        router.delete(route('dashboard.insights.acoes.destroy', [analiseDoPeriodo.id, insight.chave]), opcoesDeAcao());
    }

    const fecharAnalise = useCallback(() => setAnaliseAberta(false), []);

    function recarregar(query: Record<string, string>, only: string[]): void {
        router.get(route('dashboard'), query, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            only,
            onStart: () => setRecarregando(only),
            onFinish: () => setRecarregando([]),
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
                <PageTitle
                    title="Dashboard"
                    actions={
                        temCopiloto ? (
                            <Button type="button" variant="primary" className="inline-flex items-center gap-2" onClick={abrirAnalise}>
                                <Sparkles className="h-4 w-4" />
                                Analisar com IA
                            </Button>
                        ) : undefined
                    }
                />

                <DashboardPeriodoReferencia ano={anoSelecionado} mes={mesSelecionado} anos={anos} onPeriodoChange={trocarPeriodo} />

                <DashboardBloco data="resumo" carregando={recarregando.includes('resumo')} fallback={<ExtratoKpisSkeleton empilharNoMobile />}>
                    <ExtratoKpis resumo={resumo} empilharNoMobile />
                </DashboardBloco>

                <div className="@container flex min-w-0 flex-wrap items-stretch gap-4">
                    <div className={CARD_WRAP_DUPLO}>
                        <DashboardBloco
                            data="ranking"
                            carregando={recarregando.includes('ranking')}
                            fallback={<DashboardRankingSkeleton criterio={criterioRanking} onCriterioChange={trocarCriterioRanking} />}
                        >
                            <DashboardRanking criterio={criterioRanking} onCriterioChange={trocarCriterioRanking} itens={ranking?.itens ?? []} />
                        </DashboardBloco>
                    </div>

                    <div className={CARD_WRAP}>
                        <DashboardBloco
                            data="seriesMensais"
                            carregando={recarregando.includes('seriesMensais')}
                            fallback={<DashboardSkeleton titulo="Saldo mensal" />}
                        >
                            <DashboardGrafico
                                ano={anoSelecionado}
                                titulo="Saldo mensal"
                                pontos={pontosDeSaldo(seriesMensais?.saldos)}
                                cor="#16a34a"
                                corPorSinal
                                mensagemVazio="Sem lançamentos no ano."
                            />
                        </DashboardBloco>
                    </div>

                    <div className={CARD_WRAP}>
                        <DashboardBloco
                            data="seriesMensais"
                            carregando={recarregando.includes('seriesMensais')}
                            fallback={<DashboardSkeleton titulo="Receitas por mês" />}
                        >
                            <DashboardGrafico
                                ano={anoSelecionado}
                                titulo="Receitas por mês"
                                pontos={seriesMensais?.receitas ?? []}
                                cor={COR_RECEITA}
                                mensagemVazio="Sem receitas no ano."
                            />
                        </DashboardBloco>
                    </div>

                    <div className={CARD_WRAP}>
                        <DashboardBloco
                            data="seriesMensais"
                            carregando={recarregando.includes('seriesMensais')}
                            fallback={<DashboardSkeleton titulo="Despesas por mês" />}
                        >
                            <DashboardGrafico
                                ano={anoSelecionado}
                                titulo="Despesas por mês"
                                pontos={seriesMensais?.despesas ?? []}
                                cor={COR_DESPESA}
                                mensagemVazio="Sem despesas no ano."
                            />
                        </DashboardBloco>
                    </div>

                    <div className={CARD_WRAP}>
                        <DashboardBloco
                            data="despesasPorCategoria"
                            carregando={recarregando.includes('despesasPorCategoria')}
                            fallback={<DashboardPizzaSkeleton titulo="Despesas por categoria" />}
                        >
                            <DashboardPizza titulo="Despesas por categoria" fatias={fatiasDeCategoria(despesasPorCategoria)} />
                        </DashboardBloco>
                    </div>

                    <div className={CARD_WRAP}>
                        <DashboardBloco
                            data="despesasPorGrupoDeProduto"
                            carregando={recarregando.includes('despesasPorGrupoDeProduto')}
                            fallback={<DashboardPizzaSkeleton titulo="Por grupo de produtos" />}
                        >
                            <DashboardPizza titulo="Por grupo de produtos" fatias={fatiasDeGrupo(despesasPorGrupoDeProduto)} />
                        </DashboardBloco>
                    </div>

                    <div className={CARD_WRAP}>
                        <DashboardBloco
                            data="receitasPorDiaDaSemana"
                            carregando={recarregando.includes('receitasPorDiaDaSemana')}
                            fallback={<DashboardReceitasSkeleton />}
                        >
                            <DashboardReceitas
                                semana={semanaSelecionada}
                                semanas={semanas}
                                receitas={receitasPorDiaDaSemana ?? []}
                                onSemanaChange={trocarSemana}
                            />
                        </DashboardBloco>
                    </div>
                </div>
            </div>

            {temCopiloto && analiseAberta ? (
                <InsightsPainel
                    periodo={rotuloDoPeriodo(anoSelecionado, mesSelecionado)}
                    analise={analiseDoPeriodo?.status === 'concluida' ? analiseDoPeriodo : null}
                    carregando={gerandoAnalise || analiseEmAndamento}
                    erro={erroAnalise ?? (analiseDoPeriodo?.status === 'falhou' ? analiseDoPeriodo.erro : null)}
                    ocupado={acaoEmAndamento}
                    onFechar={fecharAnalise}
                    onGerar={gerarAnalise}
                    onVouFazer={(insight) => registrarAcao(insight, 'feito')}
                    onDispensar={(insight, motivo) => registrarAcao(insight, 'dispensado', motivo)}
                    onDesfazer={desfazerAcao}
                />
            ) : null}
        </AppLayout>
    );
}
