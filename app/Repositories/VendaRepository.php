<?php

namespace App\Repositories;

use App\DTO\VendaSearchDTO;
use App\Models\Empresa;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\Produto;
use App\Models\Venda;
use App\Repositories\Interfaces\VendaRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class VendaRepository extends AbstractRepository implements VendaRepositoryInterface
{
    public function __construct(Venda $venda)
    {
        parent::__construct($venda);
    }

    public function indexFiltrado(VendaSearchDTO $filters): LengthAwarePaginator
    {
        return $this->vendasFiltradasQuery($filters)
            ->with(['itens.produto:id,nome', 'pagamentos.formaPagamento:id,nome'])
            ->orderByDesc('data_venda')
            ->orderByDesc('id')
            ->paginate($filters->per_page, ['*'], 'page', $filters->page)
            ->withQueryString();
    }

    public function contagemPorStatus(VendaSearchDTO $filters): array
    {
        $porStatus = $this->vendasFiltradasQuery($filters, ignoreStatus: true)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $aberta = (int) ($porStatus[Venda::STATUS_ABERTA] ?? 0);
        $fechada = (int) ($porStatus[Venda::STATUS_FECHADA] ?? 0);
        $cancelada = (int) ($porStatus[Venda::STATUS_CANCELADA] ?? 0);

        return [
            'todos' => $aberta + $fechada + $cancelada,
            'aberta' => $aberta,
            'fechada' => $fechada,
            'cancelada' => $cancelada,
        ];
    }

    public function findDaEmpresa(int $id): Venda
    {
        return $this->model->newQuery()
            ->where('empresa_id', Empresa::atualId())
            ->with(['itens.produto:id,nome', 'pagamentos.formaPagamento:id,nome'])
            ->findOrFail($id);
    }

    public function substituirItens(Venda $venda, array $itens): void
    {
        $venda->itens()->delete();
        $venda->itens()->createMany($itens);
    }

    public function substituirPagamentos(Venda $venda, array $pagamentos): void
    {
        $venda->pagamentos()->delete();
        $venda->pagamentos()->createMany($pagamentos);
    }

    public function excluirFinanceirosDaVenda(int $vendaId): int
    {
        $financeiroIds = Financeiro::query()->where('venda_id', $vendaId)->pluck('id');

        FinanceiroParcela::query()->whereIn('financeiro_id', $financeiroIds)->delete();

        return Financeiro::query()->whereIn('id', $financeiroIds)->delete();
    }

    /**
     * @return Builder<Venda>
     */
    private function vendasFiltradasQuery(VendaSearchDTO $filters, bool $ignoreStatus = false): Builder
    {
        $query = $this->model->newQuery()->where('empresa_id', Empresa::atualId());

        if ($filters->data_inicio !== null) {
            $query->whereDate('data_venda', '>=', $filters->data_inicio);
        }

        if ($filters->data_fim !== null) {
            $query->whereDate('data_venda', '<=', $filters->data_fim);
        }

        if (! $ignoreStatus && $filters->status !== 'todos') {
            $query->where('status', $filters->status);
        }

        if ($filters->forma_pagamento_id !== null) {
            $query->whereHas('pagamentos', function ($pagamentos) use ($filters) {
                $pagamentos->where('forma_pagamento_id', $filters->forma_pagamento_id);
            });
        }

        if ($filters->busca !== null) {
            $this->aplicarBusca($query, $filters->busca);
        }

        return $query;
    }

    /**
     * Busca pelo código da venda (com ou sem "#"), pelo nome dos produtos ou pela observação.
     *
     * @param  Builder<Venda>  $query
     */
    private function aplicarBusca(Builder $query, string $busca): void
    {
        $codigo = ltrim($busca, '#');

        $produtosQuery = Produto::query()->where('empresa_id', Empresa::atualId());
        $this->applyAccentInsensitiveLike($produtosQuery, 'nome', $busca);
        $produtoIds = $produtosQuery->pluck('id');

        $query->where(function (Builder $q) use ($busca, $codigo, $produtoIds) {
            if ($codigo !== '' && ctype_digit($codigo)) {
                $q->orWhere('id', (int) $codigo);
            }

            if ($produtoIds->isNotEmpty()) {
                $q->orWhereHas('itens', fn (Builder $itens) => $itens->whereIn('produto_id', $produtoIds));
            }

            $q->orWhere(function (Builder $observacao) use ($busca) {
                $this->applyAccentInsensitiveLike($observacao, 'observacao', $busca);
            });
        });
    }

    public function vendasPorProdutoNoPeriodo(int $empresaId, string $dataInicio, string $dataFim): Collection
    {
        return $this->model->newQuery()
            ->toBase()
            ->join('venda_item', 'venda_item.venda_id', '=', 'venda.id')
            ->join('produto', 'produto.id', '=', 'venda_item.produto_id')
            ->where('venda.empresa_id', $empresaId)
            ->where('venda.status', Venda::STATUS_FECHADA)
            ->whereBetween('venda.data_venda', [$dataInicio.' 00:00:00', $dataFim.' 23:59:59'])
            ->selectRaw('produto.id as produto_id')
            ->selectRaw('produto.nome as produto')
            ->selectRaw('SUM(venda_item.quantidade) as quantidade')
            ->selectRaw('SUM(venda_item.valor_total) as receita')
            ->groupBy('produto.id', 'produto.nome')
            ->get();
    }

    public function resumoNoPeriodo(int $empresaId, string $dataInicio, string $dataFim): array
    {
        $periodo = [$dataInicio.' 00:00:00', $dataFim.' 23:59:59'];

        $vendas = $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->where('status', Venda::STATUS_FECHADA)
            ->whereBetween('data_venda', $periodo)
            ->selectRaw('COUNT(*) as vendas, SUM(total) as total')
            ->toBase()
            ->first();

        $itens = $this->model->newQuery()
            ->toBase()
            ->join('venda_item', 'venda_item.venda_id', '=', 'venda.id')
            ->where('venda.empresa_id', $empresaId)
            ->where('venda.status', Venda::STATUS_FECHADA)
            ->whereBetween('venda.data_venda', $periodo)
            ->count();

        return [
            'vendas' => (int) ($vendas->vendas ?? 0),
            'total' => round((float) ($vendas->total ?? 0), 2),
            'itens' => $itens,
        ];
    }
}
