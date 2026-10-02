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
            ->with(['categoria', 'conta', 'produto.fornecedor', 'produto.grupo', 'fornecedor', 'funcionario', 'financeiro']);

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
        $dir = in_array(strtolower((string)($data?->sort_dir ?? '')), ['asc', 'desc'], true) ? strtolower((string)$data?->sort_dir) : 'desc';

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
        $dir = in_array(strtolower((string)($data?->sort_dir ?? '')), ['asc', 'desc'], true) ? strtolower((string)$data?->sort_dir) : 'desc';

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
}
