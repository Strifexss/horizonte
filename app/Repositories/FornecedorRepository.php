<?php

namespace App\Repositories;

use App\Models\Fornecedor;
use App\Models\Produto;
use App\Repositories\Interfaces\FornecedorRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class FornecedorRepository extends AbstractRepository implements FornecedorRepositoryInterface
{
    public function __construct(Fornecedor $fornecedor)
    {
        parent::__construct($fornecedor);
    }

    public function autocomplete($q = null)
    {
        $query = $this->model->newQuery();

        if ($q !== null && $q !== '') {
            $this->applyAccentInsensitiveLike($query, 'nome', $q);
        }

        if (Auth::check()) {
            $query->where('usuario_id', Auth::id());
        }

        return $query->orderBy('nome')->limit(20)->get(['id', 'nome']);
    }

    public function nullifyFornecedorIdOnProdutos(int $fornecedorId): int
    {
        return Produto::query()
            ->where('fornecedor_id', $fornecedorId)
            ->update(['fornecedor_id' => null]);
    }

    public function findForUsuario(int $id): Fornecedor
    {
        return $this->model->newQuery()
            ->where('usuario_id', Auth::id())
            ->findOrFail($id);
    }
}
