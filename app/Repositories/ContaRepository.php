<?php

namespace App\Repositories;

use App\Models\Conta;
use App\Models\Empresa;
use App\Repositories\Interfaces\ContaRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class ContaRepository extends AbstractRepository implements ContaRepositoryInterface
{
    public function __construct(
        Conta $conta
    ) {
        parent::__construct($conta);
    }

    public function autocomplete($q = null)
    {
        $query = $this->model->newQuery();

        if ($q !== null && $q !== '') {
            $this->applyAccentInsensitiveLike($query, 'nome', $q);
        }

        if (Auth::check()) {
            $query->where('empresa_id', Empresa::atualId());
        }

        return $query
            ->orderByDesc('padrao')
            ->orderBy('nome')
            ->limit(20)
            ->get(['id', 'nome', 'padrao']);
    }

    public function clearPadraoDaEmpresa(int $empresaId, ?int $exceptId = null): int
    {
        $query = $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->where('padrao', 1);

        if ($exceptId !== null) {
            $query->where('id', '!=', $exceptId);
        }

        return $query->update(['padrao' => 0]);
    }

    public function padraoDaEmpresa(int $empresaId): ?Conta
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->orderByDesc('padrao')
            ->orderBy('id')
            ->first();
    }
}
