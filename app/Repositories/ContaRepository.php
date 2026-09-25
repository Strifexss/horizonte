<?php

namespace App\Repositories;

use App\Models\Conta;
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
            $query->where('nome', 'like', '%'.$q.'%');
        }

        if (Auth::check()) {
            $query->where('usuario_id', Auth::id());
        }

        return $query
            ->orderByDesc('padrao')
            ->orderBy('nome')
            ->limit(20)
            ->get(['id', 'nome', 'padrao']);
    }

    public function clearPadraoForUsuario(int $usuarioId, ?int $exceptId = null): int
    {
        $query = $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->where('padrao', 1);

        if ($exceptId !== null) {
            $query->where('id', '!=', $exceptId);
        }

        return $query->update(['padrao' => 0]);
    }
}
