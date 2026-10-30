<?php

namespace App\Repositories;

use App\Models\Empresa;
use App\Models\Fornecedor;
use App\Models\Produto;
use App\Repositories\Interfaces\FornecedorRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
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
            $query->where('empresa_id', Empresa::atualId());
        }

        return $query->orderBy('nome')->limit(20)->get(['id', 'nome']);
    }

    public function nullifyFornecedorIdOnProdutos(int $fornecedorId): int
    {
        return Produto::query()
            ->where('fornecedor_id', $fornecedorId)
            ->update(['fornecedor_id' => null]);
    }

    public function deleteByEmpresa(int $empresaId): int
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->delete();
    }

    public function findDaEmpresa(int $id): Fornecedor
    {
        return $this->model->newQuery()
            ->where('empresa_id', Empresa::atualId())
            ->findOrFail($id);
    }

    /**
     * Conta quantos fornecedores pertencem ao usuário informado.
     */
    public function countByEmpresa(int $empresaId): int
    {
        return $this->model->newQuery()->where('empresa_id', $empresaId)->count();
    }

    /**
     * Retorna todos os fornecedores do usuário.
     *
     * @return Collection<int, Fornecedor>
     */
    public function getByEmpresa(int $empresaId): mixed
    {
        return $this->model->newQuery()->where('empresa_id', $empresaId)->orderBy('id')->get();
    }
}
