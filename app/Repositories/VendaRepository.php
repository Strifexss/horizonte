<?php

namespace App\Repositories;

use App\DTO\VendaSearchDTO;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\Venda;
use App\Repositories\Interfaces\VendaRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

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

    public function findDoUsuario(int $id): Venda
    {
        return $this->model->newQuery()
            ->where('usuario_id', Auth::id())
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
        $query = $this->model->newQuery()->where('usuario_id', Auth::id());

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

        return $query;
    }
}
