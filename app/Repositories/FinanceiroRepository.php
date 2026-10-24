<?php

namespace App\Repositories;

use App\DTO\FinanceiroParcelaDTO;
use App\DTO\FinanceiroSearchDTO;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Repositories\Interfaces\FinanceiroRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FinanceiroRepository extends AbstractRepository implements FinanceiroRepositoryInterface
{
    public function __construct(Financeiro $financeiro)
    {
        parent::__construct($financeiro);
    }

    public function index($data = null)
    {
        return $this->model->newQuery()
            ->where('usuario_id', Auth::id())
            ->with('categoria')
            ->orderBy('data_criacao', 'desc')
            ->get();
    }

    public function indexParcelas(?FinanceiroSearchDTO $data = null): LengthAwarePaginator
    {
        $perPage = $data?->per_page ?? 20;

        $query = $this->parcelasFiltradasQuery($data)
            ->with(['categoria', 'conta', 'produto.fornecedor', 'produto.grupo', 'fornecedor', 'funcionario', 'financeiro.formaPagamento']);

        // Definir coluna base para data conforme tipo_data
        $colunaData = $data?->tipo_data === 'competencia' ? 'data_competencia' : 'data_vencimento';

        // Mapeamento de campos permitidos para ordenação
        $sortMap = [
            'data' => $colunaData,
            'descricao' => 'descricao',
            'quantidade' => 'quantidade',
            'valor' => 'valor',
            'valor_pago' => 'valor_pago',
        ];

        $sortCol = $data?->sort ? ($sortMap[$data->sort] ?? null) : null;
        $dir = in_array(strtolower((string) ($data?->sort_dir ?? '')), ['asc', 'desc'], true) ? strtolower((string) $data?->sort_dir) : 'desc';

        if ($sortCol) {
            $query = $query->orderBy($sortCol, $dir);
        } else {
            $query = $query->orderBy($colunaData, 'desc');
        }

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Retorna todas as parcelas aplicando os mesmos filtros, sem paginação.
     *
     * @return Collection<int, FinanceiroParcela>
     */
    public function exportParcelas(?FinanceiroSearchDTO $data = null): Collection
    {
        $query = $this->parcelasFiltradasQuery($data)
            ->with(['categoria', 'conta', 'produto.fornecedor', 'produto.grupo', 'fornecedor', 'funcionario', 'financeiro']);

        $colunaData = $data?->tipo_data === 'competencia' ? 'data_competencia' : 'data_vencimento';
        $sortMap = [
            'data' => $colunaData,
            'descricao' => 'descricao',
            'quantidade' => 'quantidade',
            'valor' => 'valor',
            'valor_pago' => 'valor_pago',
        ];

        $sortCol = $data?->sort ? ($sortMap[$data->sort] ?? null) : null;
        $dir = in_array(strtolower((string) ($data?->sort_dir ?? '')), ['asc', 'desc'], true) ? strtolower((string) $data?->sort_dir) : 'desc';

        if ($sortCol) {
            $query = $query->orderBy($sortCol, $dir);
        } else {
            $query = $query->orderBy($colunaData, 'desc');
        }

        return $query->get();
    }

    /**
     * Totais do período filtrado (sem status), para KPIs e chips.
     *
     * @return array{
     *     counts: array{todos: int, aberto: int, pago: int, parcial: int},
     *     total_credits: float|int,
     *     total_debits: float|int
     * }
     */
    public function resumoParcelas(?FinanceiroSearchDTO $data = null): array
    {
        $base = $this->parcelasFiltradasQuery($data, ignoreStatus: true);

        $todos = (clone $base)->count();

        $aberto = (clone $base)->where(function ($q) {
            $q->whereNull('valor_pago')->orWhere('valor_pago', 0);
        })->count();

        $pago = (clone $base)->whereColumn('valor_pago', '>=', 'valor')->count();

        $parcial = (clone $base)->where('valor_pago', '>', 0)
            ->whereColumn('valor_pago', '<', 'valor')
            ->count();

        $totalCredits = (clone $base)->whereHas('financeiro', function ($q) {
            $q->whereRaw('UPPER(tipo) = ?', ['RECEITA']);
        })->sum('valor');

        $totalDebits = (clone $base)->whereHas('financeiro', function ($q) {
            $q->whereRaw('UPPER(tipo) = ?', ['DESPESA']);
        })->sum('valor');

        return [
            'counts' => [
                'todos' => $todos,
                'aberto' => $aberto,
                'pago' => $pago,
                'parcial' => $parcial,
            ],
            'total_credits' => $totalCredits ?: 0,
            'total_debits' => $totalDebits ?: 0,
        ];
    }

    public function storeParcela(FinanceiroParcelaDTO $dto)
    {
        return FinanceiroParcela::create($dto->all());
    }

    /**
     * @return Builder<FinanceiroParcela>
     */
    private function parcelasFiltradasQuery(?FinanceiroSearchDTO $data = null, bool $ignoreStatus = false): Builder
    {
        $query = FinanceiroParcela::query()
            ->where('usuario_id', Auth::id());

        if (! $data instanceof FinanceiroSearchDTO) {
            return $query;
        }

        $coluna = $data->tipo_data === 'competencia' ? 'data_competencia' : 'data_vencimento';

        if ($data->data_inicio !== null) {
            $query->whereDate($coluna, '>=', $data->data_inicio);
        }

        if ($data->data_fim !== null) {
            $query->whereDate($coluna, '<=', $data->data_fim);
        }

        if ($data->conta_id !== null) {
            $query->where(function ($q) use ($data) {
                $q->where('conta_id', $data->conta_id)
                    ->orWhereHas('financeiro', function ($fq) use ($data) {
                        $fq->where('conta_id', $data->conta_id);
                    });
            });
        }

        if ($data->categoria_id !== null) {
            $query->where(function ($q) use ($data) {
                $q->where('categoria_id', $data->categoria_id)
                    ->orWhereHas('financeiro', function ($fq) use ($data) {
                        $fq->where('categoria_id', $data->categoria_id);
                    });
            });
        }

        if ($data->produto_id !== null) {
            $query->where('produto_id', $data->produto_id);
        }

        if ($data->grupo_id !== null) {
            $query->whereHas('produto', function ($q) use ($data) {
                $q->where('grupo_id', $data->grupo_id);
            });
        }

        if ($data->fornecedor_id !== null) {
            $query->where('fornecedor_id', $data->fornecedor_id);
        }

        if ($data->forma_pagamento_id !== null) {
            $query->whereHas('financeiro', function ($fq) use ($data) {
                $fq->where('forma_pagamento_id', $data->forma_pagamento_id);
            });
        }

        if ($data->busca !== null && $data->busca !== '') {
            $this->applyAccentInsensitiveLike($query, 'descricao', $data->busca);
        }

        if (! $ignoreStatus) {
            if ($data->status === 'aberto') {
                $query->where(function ($q) {
                    $q->whereNull('valor_pago')->orWhere('valor_pago', 0);
                });
            } elseif ($data->status === 'pago') {
                $query->whereColumn('valor_pago', '>=', 'valor');
            } elseif ($data->status === 'parcial') {
                $query->where('valor_pago', '>', 0)
                    ->whereColumn('valor_pago', '<', 'valor');
            }
        }

        return $query;
    }

    public function receitasMensaisPorCompetencia(int $ano): Collection
    {
        return $this->somasMensaisPorTipo($ano, 'RECEITA');
    }

    public function despesasMensaisPorCompetencia(int $ano): Collection
    {
        return $this->somasMensaisPorTipo($ano, 'DESPESA');
    }

    /**
     * @return Collection<int, object{mes: int|string, valor: float|int|string}>
     */
    private function somasMensaisPorTipo(int $ano, string $tipo): Collection
    {
        $coluna = 'financeiro_parcela.data_competencia';
        $mes = $this->expressaoMes($coluna);

        return FinanceiroParcela::query()
            ->toBase()
            ->join('financeiro', 'financeiro.id', '=', 'financeiro_parcela.financeiro_id')
            ->where('financeiro_parcela.usuario_id', Auth::id())
            ->whereRaw('UPPER(financeiro.tipo) = ?', [$tipo])
            ->whereYear($coluna, $ano)
            ->selectRaw($mes.' as mes')
            ->selectRaw('SUM(financeiro_parcela.valor) as valor')
            ->groupByRaw($mes)
            ->orderBy('mes')
            ->get();
    }

    public function despesasPorCategoriaNoPeriodo(string $dataInicio, string $dataFim): Collection
    {
        return FinanceiroParcela::query()
            ->toBase()
            ->join('financeiro', 'financeiro.id', '=', 'financeiro_parcela.financeiro_id')
            ->leftJoin('categoria', 'categoria.id', '=', 'financeiro_parcela.categoria_id')
            ->where('financeiro_parcela.usuario_id', Auth::id())
            ->whereRaw("UPPER(financeiro.tipo) = 'DESPESA'")
            ->whereBetween('financeiro_parcela.data_competencia', [$dataInicio, $dataFim])
            ->selectRaw("COALESCE(categoria.nome, 'Sem categoria') as categoria")
            ->selectRaw('SUM(financeiro_parcela.valor) as valor')
            ->groupByRaw("COALESCE(categoria.nome, 'Sem categoria')")
            ->havingRaw('SUM(financeiro_parcela.valor) > 0')
            ->orderBy('categoria')
            ->get();
    }

    public function despesasPorGrupoDeProdutoNoPeriodo(string $dataInicio, string $dataFim): Collection
    {
        return FinanceiroParcela::query()
            ->toBase()
            ->join('financeiro', 'financeiro.id', '=', 'financeiro_parcela.financeiro_id')
            ->join('produto', 'produto.id', '=', 'financeiro_parcela.produto_id')
            ->leftJoin('grupos', 'grupos.id', '=', 'produto.grupo_id')
            ->where('financeiro_parcela.usuario_id', Auth::id())
            ->whereRaw("UPPER(financeiro.tipo) = 'DESPESA'")
            ->whereBetween('financeiro_parcela.data_competencia', [$dataInicio, $dataFim])
            ->selectRaw("COALESCE(grupos.nome, 'Sem grupo') as grupo")
            ->selectRaw('SUM(financeiro_parcela.valor) as valor')
            ->groupByRaw("COALESCE(grupos.nome, 'Sem grupo')")
            ->havingRaw('SUM(financeiro_parcela.valor) > 0')
            ->orderBy('grupo')
            ->get();
    }

    public function rankingNoPeriodo(string $criterio, string $dataInicio, string $dataFim): Collection
    {
        $query = FinanceiroParcela::query()
            ->toBase()
            ->join('financeiro', 'financeiro.id', '=', 'financeiro_parcela.financeiro_id')
            ->where('financeiro_parcela.usuario_id', Auth::id())
            ->whereBetween('financeiro_parcela.data_competencia', [$dataInicio, $dataFim]);

        [$tabela, $chave, $tipo] = match ($criterio) {
            'fornecedores' => ['fornecedor', 'financeiro_parcela.fornecedor_id', 'DESPESA'],
            'categorias_despesa' => ['categoria', 'financeiro_parcela.categoria_id', 'DESPESA'],
            'categorias_receita' => ['categoria', 'financeiro_parcela.categoria_id', 'RECEITA'],
            default => ['produto', 'financeiro_parcela.produto_id', 'DESPESA'],
        };

        return $query
            ->join($tabela, $tabela.'.id', '=', $chave)
            ->whereRaw('UPPER(financeiro.tipo) = ?', [$tipo])
            ->selectRaw($tabela.'.nome as nome')
            ->selectRaw('SUM(financeiro_parcela.valor) as valor')
            ->selectRaw('COUNT(*) as lancamentos')
            ->groupBy($tabela.'.id', $tabela.'.nome')
            ->havingRaw('SUM(financeiro_parcela.valor) > 0')
            ->orderByDesc('valor')
            ->orderBy('nome')
            ->get();
    }

    public function comprasPorProdutoNoPeriodo(int $usuarioId, string $dataInicio, string $dataFim): Collection
    {
        return FinanceiroParcela::query()
            ->toBase()
            ->join('financeiro', 'financeiro.id', '=', 'financeiro_parcela.financeiro_id')
            ->join('produto', 'produto.id', '=', 'financeiro_parcela.produto_id')
            ->leftJoin('grupos', 'grupos.id', '=', 'produto.grupo_id')
            ->where('financeiro_parcela.usuario_id', $usuarioId)
            ->whereRaw("UPPER(financeiro.tipo) = 'DESPESA'")
            ->whereBetween('financeiro_parcela.data_competencia', [$dataInicio, $dataFim])
            ->selectRaw('produto.id as produto_id')
            ->selectRaw('produto.nome as produto')
            ->selectRaw('grupos.nome as grupo')
            ->selectRaw('SUM(COALESCE(financeiro_parcela.quantidade, 0)) as quantidade')
            ->selectRaw('SUM(financeiro_parcela.valor) as custo')
            ->selectRaw('COUNT(*) as lancamentos')
            ->groupBy('produto.id', 'produto.nome', 'grupos.nome')
            ->get();
    }

    public function totaisNoPeriodo(int $usuarioId, string $dataInicio, string $dataFim): array
    {
        $linha = FinanceiroParcela::query()
            ->toBase()
            ->join('financeiro', 'financeiro.id', '=', 'financeiro_parcela.financeiro_id')
            ->where('financeiro_parcela.usuario_id', $usuarioId)
            ->whereBetween('financeiro_parcela.data_competencia', [$dataInicio, $dataFim])
            ->selectRaw("SUM(CASE WHEN UPPER(financeiro.tipo) = 'RECEITA' THEN financeiro_parcela.valor ELSE 0 END) as receitas")
            ->selectRaw("SUM(CASE WHEN UPPER(financeiro.tipo) = 'DESPESA' THEN financeiro_parcela.valor ELSE 0 END) as despesas")
            ->selectRaw('COUNT(*) as lancamentos')
            ->first();

        return [
            'receitas' => round((float) ($linha->receitas ?? 0), 2),
            'despesas' => round((float) ($linha->despesas ?? 0), 2),
            'lancamentos' => (int) ($linha->lancamentos ?? 0),
        ];
    }

    public function emAbertoComVencimentoEntre(int $usuarioId, string $dataInicio, string $dataFim): array
    {
        $linha = FinanceiroParcela::query()
            ->toBase()
            ->join('financeiro', 'financeiro.id', '=', 'financeiro_parcela.financeiro_id')
            ->where('financeiro_parcela.usuario_id', $usuarioId)
            ->whereBetween('financeiro_parcela.data_vencimento', [$dataInicio, $dataFim])
            ->whereColumn('financeiro_parcela.valor_pago', '<', 'financeiro_parcela.valor')
            ->selectRaw("SUM(CASE WHEN UPPER(financeiro.tipo) = 'RECEITA' THEN financeiro_parcela.valor - COALESCE(financeiro_parcela.valor_pago, 0) ELSE 0 END) as a_receber")
            ->selectRaw("SUM(CASE WHEN UPPER(financeiro.tipo) = 'DESPESA' THEN financeiro_parcela.valor - COALESCE(financeiro_parcela.valor_pago, 0) ELSE 0 END) as a_pagar")
            ->first();

        return [
            'a_receber' => round((float) ($linha->a_receber ?? 0), 2),
            'a_pagar' => round((float) ($linha->a_pagar ?? 0), 2),
        ];
    }

    public function receitasPorDiaDaSemanaNoPeriodo(string $dataInicio, string $dataFim): Collection
    {
        $coluna = 'financeiro_parcela.data_competencia';
        $dia = $this->expressaoDiaDaSemanaIso($coluna);

        return FinanceiroParcela::query()
            ->toBase()
            ->join('financeiro', 'financeiro.id', '=', 'financeiro_parcela.financeiro_id')
            ->where('financeiro_parcela.usuario_id', Auth::id())
            ->whereRaw("UPPER(financeiro.tipo) = 'RECEITA'")
            ->whereBetween($coluna, [$dataInicio, $dataFim])
            ->selectRaw($dia.' as dia')
            ->selectRaw('SUM(financeiro_parcela.valor) as valor')
            ->groupByRaw($dia)
            ->orderBy('dia')
            ->get();
    }

    private function expressaoMes(string $coluna): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "CAST(strftime('%m', {$coluna}) AS INTEGER)",
            'pgsql' => "EXTRACT(MONTH FROM {$coluna})::int",
            default => "MONTH({$coluna})",
        };
    }

    private function expressaoDiaDaSemanaIso(string $coluna): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => '((CAST(strftime(\'%w\', '.$coluna.') AS INTEGER) + 6) % 7) + 1',
            'pgsql' => 'EXTRACT(ISODOW FROM '.$coluna.')::int',
            default => '((DAYOFWEEK('.$coluna.') + 5) % 7) + 1',
        };
    }
}
