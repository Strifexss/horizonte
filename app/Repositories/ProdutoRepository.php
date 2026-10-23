<?php

namespace App\Repositories;

use App\DTO\ProdutoSearchDTO;
use App\Models\FinanceiroParcela;
use App\Models\Produto;
use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
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

    public function indexFiltrado(ProdutoSearchDTO $filters): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        if (Auth::check()) {
            $query->where('usuario_id', Auth::id());
        }

        if ($filters->busca) {
            $this->applyAccentInsensitiveLike($query, 'nome', $filters->busca);
        }

        $sort = $filters->sort ?? 'nome';
        $allowed = ['nome', 'preco_compra', 'preco_venda', 'ativo'];
        if (! in_array($sort, $allowed, true)) {
            $sort = 'nome';
        }

        $dir = ($filters->sort_dir ?? 'asc') === 'desc' ? 'desc' : 'asc';

        return $query
            ->with(['fornecedor', 'grupo'])
            ->orderBy($sort, $dir)
            ->orderBy('id')
            ->paginate($filters->per_page, ['*'], 'page', $filters->page);
    }

    public function nullifyProdutoIdOnParcelas(int $produtoId): int
    {
        return FinanceiroParcela::query()
            ->where('produto_id', $produtoId)
            ->update(['produto_id' => null]);
    }

    public function countParcelasByProdutoId(int $produtoId): int
    {
        return FinanceiroParcela::query()
            ->where('produto_id', $produtoId)
            ->count();
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
