<?php

namespace App\Repositories;

use App\Models\FinanceiroParcela;
use App\Models\Produto;
use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class ProdutoRepository extends AbstractRepository implements ProdutoRepositoryInterface
{
    public function __construct(Produto $produto)
    {
        parent::__construct($produto);
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

        return $query
            ->with('fornecedor', 'grupo')
            ->orderBy('nome')
            ->limit(20)
            ->get(['id', 'nome', 'preco_compra', 'fornecedor_id', 'grupo_id']);
    }

    /**
     * Retorna lista de produtos do usuário com relação de fornecedor carregada.
     */
    public function index($data = null)
    {
        $query = $this->model->newQuery();

        if (Auth::check()) {
            $query->where('usuario_id', Auth::id());
        }

        return $query->with('fornecedor', 'grupo')->orderBy('nome')->get();
    }

    public function nullifyProdutoIdOnParcelas(int $produtoId): int
    {
        return FinanceiroParcela::query()
            ->where('produto_id', $produtoId)
            ->update(['produto_id' => null]);
    }

    /**
     * Garante que o produto pertence ao usuário autenticado.
     */
    public function findForUsuario(int $id): Produto
    {
        return $this->model->newQuery()
            ->where('usuario_id', Auth::id())
            ->findOrFail($id);
    }

    /**
     * Conta quantos produtos pertencem ao usuário informado.
     */
    public function countByUsuario(int $usuarioId): int
    {
        return $this->model->newQuery()->where('usuario_id', $usuarioId)->count();
    }

    /**
     * Retorna todos os produtos do usuário (coleção).
     *
     * @return Collection<int, Produto>
     */
    public function getByUsuario(int $usuarioId): mixed
    {
        return $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->with('fornecedor', 'grupo')
            ->orderBy('id')
            ->get();
    }
}
