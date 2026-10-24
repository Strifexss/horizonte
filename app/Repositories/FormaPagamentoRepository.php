<?php

namespace App\Repositories;

use App\Models\Financeiro;
use App\Models\FormaPagamento;
use App\Models\VendaPagamento;
use App\Repositories\Interfaces\FormaPagamentoRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class FormaPagamentoRepository extends AbstractRepository implements FormaPagamentoRepositoryInterface
{
    public function __construct(FormaPagamento $formaPagamento)
    {
        parent::__construct($formaPagamento);
    }

    public function index($data = null)
    {
        return $this->visiveisQuery()
            ->orderByDesc('padrao')
            ->orderBy('nome')
            ->get();
    }

    public function ativas(): Collection
    {
        return $this->visiveisQuery()
            ->where('ativo', true)
            ->orderByDesc('padrao')
            ->orderBy('id')
            ->get();
    }

    public function autocomplete($q = null)
    {
        $query = $this->visiveisQuery()->where('ativo', true);

        if ($q !== null && $q !== '') {
            $this->applyAccentInsensitiveLike($query, 'nome', $q);
        }

        return $query
            ->orderByDesc('padrao')
            ->orderBy('nome')
            ->limit(20)
            ->get(['id', 'nome', 'baixa_automatica', 'padrao']);
    }

    public function findVisivel(int $id): FormaPagamento
    {
        return $this->visiveisQuery()->findOrFail($id);
    }

    public function countUsos(int $id): int
    {
        return Financeiro::query()->where('forma_pagamento_id', $id)->count()
            + VendaPagamento::query()->where('forma_pagamento_id', $id)->count();
    }

    /**
     * @return Builder<FormaPagamento>
     */
    private function visiveisQuery(): Builder
    {
        return $this->model->newQuery()->where(function (Builder $query) {
            $query->whereNull('usuario_id')->orWhere('usuario_id', Auth::id());
        });
    }
}
