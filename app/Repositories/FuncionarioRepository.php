<?php

namespace App\Repositories;

use App\Models\FinanceiroParcela;
use App\Models\Funcionario;
use App\Repositories\Interfaces\FuncionarioRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class FuncionarioRepository extends AbstractRepository implements FuncionarioRepositoryInterface
{
    public function __construct(Funcionario $funcionario)
    {
        parent::__construct($funcionario);
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
            ->orderBy('nome')
            ->limit(20)
            ->get(['id', 'nome', 'salario']);
    }

    public function nullifyFuncionarioIdOnParcelas(int $funcionarioId): int
    {
        return FinanceiroParcela::query()
            ->where('funcionario_id', $funcionarioId)
            ->update(['funcionario_id' => null]);
    }

    public function findForUsuario(int $id): Funcionario
    {
        return $this->model->newQuery()
            ->where('usuario_id', Auth::id())
            ->findOrFail($id);
    }
}
