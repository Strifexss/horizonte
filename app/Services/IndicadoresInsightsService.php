<?php

namespace App\Services;

use App\Models\InsightAcao;
use App\Repositories\Interfaces\FinanceiroRepositoryInterface;
use App\Repositories\Interfaces\InsightAcaoRepositoryInterface;
use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use App\Repositories\Interfaces\VendaRepositoryInterface;
use App\Services\Interfaces\IndicadoresInsightsServiceInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Monta o pacote de indicadores enviado à IA. Toda conta é feita aqui:
 * a IA só interpreta os números prontos.
 */
class IndicadoresInsightsService extends ServiceAbstract implements IndicadoresInsightsServiceInterface
{
    private const MESES_DE_COMPARACAO = 3;

    private const LIMITE_PRODUTOS = 15;

    private const LIMITE_CATEGORIAS = 10;

    private const DIAS = [1 => 'segunda', 2 => 'terça', 3 => 'quarta', 4 => 'quinta', 5 => 'sexta', 6 => 'sábado', 7 => 'domingo'];

    public function __construct(
        private FinanceiroRepositoryInterface $financeiroRepository,
        private VendaRepositoryInterface $vendaRepository,
        private ProdutoRepositoryInterface $produtoRepository,
        private InsightAcaoRepositoryInterface $insightAcaoRepository,
    ) {
        parent::__construct($financeiroRepository);
    }

    public function montar(int $usuarioId, int $ano, int $mes): array
    {
        $inicio = Carbon::create($ano, $mes, 1)->startOfDay();
        $fim = $inicio->copy()->endOfMonth();
        $anteriores = $this->mesesAnteriores($inicio);

        $totais = $this->financeiroRepository->totaisNoPeriodo($usuarioId, $inicio->toDateString(), $fim->toDateString());
        $totaisAnteriores = array_map(
            fn (array $periodo): array => $this->financeiroRepository->totaisNoPeriodo($usuarioId, $periodo[0], $periodo[1]),
            $anteriores,
        );
        $anoAnterior = $this->financeiroRepository->totaisNoPeriodo(
            $usuarioId,
            $inicio->copy()->subYear()->toDateString(),
            $fim->copy()->subYear()->endOfMonth()->toDateString(),
        );

        $mediaReceitas = $this->media(array_column($totaisAnteriores, 'receitas'));
        $mediaDespesas = $this->media(array_column($totaisAnteriores, 'despesas'));
        $saldo = round($totais['receitas'] - $totais['despesas'], 2);

        return [
            'periodo' => [
                'ano' => $ano,
                'mes' => $mes,
                'rotulo' => $inicio->locale('pt_BR')->translatedFormat('F \d\e Y'),
                'meses_anteriores_com_dados' => count(array_filter($totaisAnteriores, fn (array $t): bool => $t['lancamentos'] > 0)),
                'lancamentos_no_mes' => $totais['lancamentos'],
            ],
            'resumo_do_mes' => [
                'receitas' => $totais['receitas'],
                'despesas' => $totais['despesas'],
                'saldo' => $saldo,
                'margem_percentual' => $this->percentual($saldo, $totais['receitas']),
                'media_receitas_3_meses' => $mediaReceitas,
                'media_despesas_3_meses' => $mediaDespesas,
                'variacao_receitas_vs_media_percentual' => $this->variacao($totais['receitas'], $mediaReceitas),
                'variacao_despesas_vs_media_percentual' => $this->variacao($totais['despesas'], $mediaDespesas),
                'mesmo_mes_ano_anterior' => $anoAnterior['lancamentos'] > 0 ? [
                    'receitas' => $anoAnterior['receitas'],
                    'despesas' => $anoAnterior['despesas'],
                    'variacao_receitas_percentual' => $this->variacao($totais['receitas'], $anoAnterior['receitas']),
                    'variacao_despesas_percentual' => $this->variacao($totais['despesas'], $anoAnterior['despesas']),
                ] : null,
            ],
            'despesas_por_categoria' => $this->despesasPorCategoria($inicio, $fim, $anteriores),
            'produtos' => $this->produtos($usuarioId, $inicio, $fim, $anteriores),
            'vendas' => $this->vendas($usuarioId, $inicio, $fim, $anteriores),
            'receitas_por_dia_da_semana_ultimas_4_semanas' => $this->receitasPorDiaDaSemana($fim),
            'maiores_fornecedores' => $this->fornecedores($inicio, $fim),
            'caixa' => $this->caixa($usuarioId, $inicio),
            'produtos_com_preco_suspeito' => $this->produtoRepository->ativosComPrecoDeVendaSuspeito($usuarioId)
                ->map(fn ($produto): array => [
                    'produto' => $produto->nome,
                    'preco_compra' => round((float) $produto->preco_compra, 2),
                    'preco_venda' => round((float) $produto->preco_venda, 2),
                ])
                ->values()
                ->all(),
            'historico_do_usuario' => $this->historico($usuarioId),
        ];
    }

    /**
     * @return list<array{0: string, 1: string}>
     */
    private function mesesAnteriores(Carbon $inicio): array
    {
        $periodos = [];

        for ($indice = 1; $indice <= self::MESES_DE_COMPARACAO; $indice++) {
            $mes = $inicio->copy()->subMonthsNoOverflow($indice);
            $periodos[] = [$mes->toDateString(), $mes->copy()->endOfMonth()->toDateString()];
        }

        return $periodos;
    }

    /**
     * @param  list<array{0: string, 1: string}>  $anteriores
     * @return list<array<string, mixed>>
     */
    private function despesasPorCategoria(Carbon $inicio, Carbon $fim, array $anteriores): array
    {
        $doMes = $this->financeiroRepository->despesasPorCategoriaNoPeriodo($inicio->toDateString(), $fim->toDateString());
        $historico = collect($anteriores)->map(
            fn (array $periodo): Collection => $this->financeiroRepository
                ->despesasPorCategoriaNoPeriodo($periodo[0], $periodo[1])
                ->keyBy('categoria'),
        );

        return $doMes
            ->sortByDesc(fn ($linha): float => (float) $linha->valor)
            ->take(self::LIMITE_CATEGORIAS)
            ->map(function ($linha) use ($historico): array {
                $valor = round((float) $linha->valor, 2);
                $media = $this->media($historico->map(fn (Collection $mes): float => (float) ($mes->get($linha->categoria)->valor ?? 0))->all());

                return [
                    'categoria' => (string) $linha->categoria,
                    'valor_mes' => $valor,
                    'media_3_meses' => $media,
                    'variacao_percentual' => $this->variacao($valor, $media),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Compra e venda do mesmo produto lado a lado, com custo por unidade e margem.
     *
     * @param  list<array{0: string, 1: string}>  $anteriores
     * @return list<array<string, mixed>>
     */
    private function produtos(int $usuarioId, Carbon $inicio, Carbon $fim, array $anteriores): array
    {
        $compras = $this->financeiroRepository->comprasPorProdutoNoPeriodo($usuarioId, $inicio->toDateString(), $fim->toDateString())->keyBy('produto_id');
        $vendas = $this->vendaRepository->vendasPorProdutoNoPeriodo($usuarioId, $inicio->toDateString(), $fim->toDateString())->keyBy('produto_id');
        $comprasAnteriores = collect($anteriores)->map(fn (array $p): Collection => $this->financeiroRepository->comprasPorProdutoNoPeriodo($usuarioId, $p[0], $p[1])->keyBy('produto_id'));
        $vendasAnteriores = collect($anteriores)->map(fn (array $p): Collection => $this->vendaRepository->vendasPorProdutoNoPeriodo($usuarioId, $p[0], $p[1])->keyBy('produto_id'));

        return $compras->keys()
            ->merge($vendas->keys())
            ->unique()
            ->map(function (int|string $produtoId) use ($compras, $vendas, $comprasAnteriores, $vendasAnteriores): array {
                $compra = $compras->get($produtoId);
                $venda = $vendas->get($produtoId);

                $quantidadeComprada = round((float) ($compra->quantidade ?? 0), 3);
                $custo = round((float) ($compra->custo ?? 0), 2);
                $custoUnitario = $quantidadeComprada > 0 ? round($custo / $quantidadeComprada, 2) : null;
                $quantidadeVendida = round((float) ($venda->quantidade ?? 0), 3);
                $receita = round((float) ($venda->receita ?? 0), 2);

                $mediaQuantidadeComprada = $this->media($comprasAnteriores->map(fn (Collection $m): float => (float) ($m->get($produtoId)->quantidade ?? 0))->all());
                $mediaCusto = $this->media($comprasAnteriores->map(fn (Collection $m): float => (float) ($m->get($produtoId)->custo ?? 0))->all());
                $mediaCustoUnitario = $mediaQuantidadeComprada > 0 ? round($mediaCusto / $mediaQuantidadeComprada, 2) : null;
                $mediaQuantidadeVendida = $this->media($vendasAnteriores->map(fn (Collection $m): float => (float) ($m->get($produtoId)->quantidade ?? 0))->all());
                $mediaReceita = $this->media($vendasAnteriores->map(fn (Collection $m): float => (float) ($m->get($produtoId)->receita ?? 0))->all());

                $custoDasVendas = $custoUnitario !== null ? round($quantidadeVendida * $custoUnitario, 2) : null;
                $margem = $custoDasVendas !== null && $receita > 0 ? round($receita - $custoDasVendas, 2) : null;

                return [
                    'produto' => (string) ($compra->produto ?? $venda->produto),
                    'grupo' => $compra->grupo ?? null,
                    'compra' => [
                        'quantidade' => $quantidadeComprada,
                        'custo_total' => $custo,
                        'custo_por_unidade' => $custoUnitario,
                        'lancamentos' => (int) ($compra->lancamentos ?? 0),
                    ],
                    'compra_media_3_meses' => [
                        'quantidade' => $mediaQuantidadeComprada,
                        'custo_total' => $mediaCusto,
                        'custo_por_unidade' => $mediaCustoUnitario,
                    ],
                    'venda' => [
                        'quantidade' => $quantidadeVendida,
                        'receita' => $receita,
                        'preco_medio' => $quantidadeVendida > 0 ? round($receita / $quantidadeVendida, 2) : null,
                    ],
                    'venda_media_3_meses' => [
                        'quantidade' => $mediaQuantidadeVendida,
                        'receita' => $mediaReceita,
                    ],
                    'variacao_percentual' => [
                        'quantidade_comprada' => $this->variacao($quantidadeComprada, $mediaQuantidadeComprada),
                        'custo_total' => $this->variacao($custo, $mediaCusto),
                        'custo_por_unidade' => $custoUnitario !== null && $mediaCustoUnitario !== null ? $this->variacao($custoUnitario, $mediaCustoUnitario) : null,
                        'quantidade_vendida' => $this->variacao($quantidadeVendida, $mediaQuantidadeVendida),
                        'receita' => $this->variacao($receita, $mediaReceita),
                    ],
                    'margem' => [
                        'valor' => $margem,
                        'percentual' => $margem !== null ? $this->percentual($margem, $receita) : null,
                        'custo_sobre_receita_percentual' => $custoDasVendas !== null ? $this->percentual($custoDasVendas, $receita) : null,
                    ],
                ];
            })
            ->sortByDesc(fn (array $item): float => $item['venda']['receita'] + $item['compra']['custo_total'])
            ->take(self::LIMITE_PRODUTOS)
            ->values()
            ->all();
    }

    /**
     * @param  list<array{0: string, 1: string}>  $anteriores
     * @return array<string, mixed>
     */
    private function vendas(int $usuarioId, Carbon $inicio, Carbon $fim, array $anteriores): array
    {
        $atual = $this->indicadoresDeVenda($this->vendaRepository->resumoNoPeriodo($usuarioId, $inicio->toDateString(), $fim->toDateString()));
        $historico = array_map(
            fn (array $p): array => $this->indicadoresDeVenda($this->vendaRepository->resumoNoPeriodo($usuarioId, $p[0], $p[1])),
            $anteriores,
        );
        $comVendas = array_values(array_filter($historico, fn (array $h): bool => $h['vendas'] > 0));

        return [
            ...$atual,
            'media_3_meses' => [
                'vendas' => $this->media(array_column($historico, 'vendas')),
                'ticket_medio' => $comVendas ? $this->media(array_column($comVendas, 'ticket_medio')) : null,
                'itens_por_venda' => $comVendas ? $this->media(array_column($comVendas, 'itens_por_venda')) : null,
            ],
        ];
    }

    /**
     * @param  array{vendas: int, total: float, itens: int}  $resumo
     * @return array{vendas: int, total: float, ticket_medio: ?float, itens_por_venda: ?float}
     */
    private function indicadoresDeVenda(array $resumo): array
    {
        return [
            'vendas' => $resumo['vendas'],
            'total' => $resumo['total'],
            'ticket_medio' => $resumo['vendas'] > 0 ? round($resumo['total'] / $resumo['vendas'], 2) : null,
            'itens_por_venda' => $resumo['vendas'] > 0 ? round($resumo['itens'] / $resumo['vendas'], 2) : null,
        ];
    }

    /**
     * @return list<array{dia: string, valor: float}>|null
     */
    private function receitasPorDiaDaSemana(Carbon $fimDoMes): ?array
    {
        $fim = $fimDoMes->copy()->min(now())->startOfDay();
        $inicio = $fim->copy()->subDays(27);

        $somas = $this->financeiroRepository
            ->receitasPorDiaDaSemanaNoPeriodo($inicio->toDateString(), $fim->toDateString())
            ->keyBy(fn ($linha): int => (int) $linha->dia);

        if ($somas->isEmpty()) {
            return null;
        }

        $dias = [];

        foreach (self::DIAS as $numero => $nome) {
            $dias[] = ['dia' => $nome, 'valor' => round((float) ($somas->get($numero)->valor ?? 0), 2)];
        }

        return $dias;
    }

    /**
     * @return list<array{fornecedor: string, valor: float, lancamentos: int}>
     */
    private function fornecedores(Carbon $inicio, Carbon $fim): array
    {
        return $this->financeiroRepository
            ->rankingNoPeriodo('fornecedores', $inicio->toDateString(), $fim->toDateString())
            ->take(5)
            ->map(fn ($linha): array => [
                'fornecedor' => (string) $linha->nome,
                'valor' => round((float) $linha->valor, 2),
                'lancamentos' => (int) $linha->lancamentos,
            ])
            ->values()
            ->all();
    }

    /**
     * Previsão dos próximos 30 dias (só para o mês corrente) e valores atrasados.
     *
     * @return array<string, mixed>
     */
    private function caixa(int $usuarioId, Carbon $inicio): array
    {
        $hoje = now()->startOfDay();
        $atrasados = $this->financeiroRepository->emAbertoComVencimentoEntre($usuarioId, '1900-01-01', $hoje->copy()->subDay()->toDateString());
        $proximos = null;

        if ($inicio->isSameMonth($hoje)) {
            $previsto = $this->financeiroRepository->emAbertoComVencimentoEntre($usuarioId, $hoje->toDateString(), $hoje->copy()->addDays(30)->toDateString());
            $proximos = [
                ...$previsto,
                'diferenca' => round($previsto['a_receber'] - $previsto['a_pagar'], 2),
            ];
        }

        return [
            'proximos_30_dias' => $proximos,
            'atrasados' => $atrasados,
        ];
    }

    /**
     * @return array{seguidos: list<array<string, mixed>>, dispensados: list<array<string, mixed>>}
     */
    private function historico(int $usuarioId): array
    {
        $acoes = $this->insightAcaoRepository->historicoDoUsuario($usuarioId);
        $formatar = fn (InsightAcao $acao): array => array_filter([
            'tipo' => $acao->tipo,
            'titulo' => $acao->titulo,
            'motivo' => $acao->motivo,
            'mes_da_analise' => sprintf('%02d/%d', $acao->mes, $acao->ano),
        ], fn ($valor) => $valor !== null);

        return [
            'seguidos' => $acoes->where('acao', InsightAcao::ACAO_FEITO)->map($formatar)->values()->all(),
            'dispensados' => $acoes->where('acao', InsightAcao::ACAO_DISPENSADO)->map($formatar)->values()->all(),
        ];
    }

    /**
     * @param  array<int, float|int>  $valores
     */
    private function media(array $valores): float
    {
        return $valores === [] ? 0.0 : round(array_sum($valores) / count($valores), 2);
    }

    private function variacao(float $atual, float $base): ?float
    {
        return $base > 0 ? round(($atual - $base) / $base * 100, 1) : null;
    }

    private function percentual(float $parte, float $total): ?float
    {
        return $total > 0 ? round($parte / $total * 100, 1) : null;
    }
}
