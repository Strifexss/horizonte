<?php

namespace App\Repositories;

use App\DTO\ProdutoSearchDTO;
use App\Models\FinanceiroParcela;
use App\Models\Produto;
use App\Models\VendaItem;
use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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

    public function countVendaItensByProdutoId(int $produtoId): int
    {
        return VendaItem::query()
            ->where('produto_id', $produtoId)
            ->count();
    }

    public function findManyDoUsuario(array $ids): Collection
    {
        return $this->model->newQuery()
            ->where('usuario_id', Auth::id())
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id');
    }

    public function autocompleteParaVenda(?string $q = null): Collection
    {
        $query = $this->model->newQuery()
            ->where('usuario_id', Auth::id())
            ->where('ativo', true);

        if ($q !== null && $q !== '') {
            $this->applyAccentInsensitiveLike($query, 'nome', $q);
        }

        return $query
            ->orderBy('nome')
            ->limit(20)
            ->get(['id', 'nome', 'preco_venda']);
    }

    public function ativosDoUsuario(int $usuarioId): Collection
    {
        return $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->where('ativo', true)
            ->with('grupo')
            ->orderBy('nome')
            ->get();
    }

    public function ativosComPrecoDeVendaSuspeito(int $usuarioId): Collection
    {
        return $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->where('ativo', true)
            ->where(fn ($query) => $query
                ->where('preco_venda', '<=', 0)
                ->orWhereColumn('preco_venda', '<', 'preco_compra'))
            ->orderBy('nome')
            ->get(['id', 'nome', 'preco_compra', 'preco_venda']);
    }

    public function atualizarFoto(int $id, ?string $fotoPath): Produto
    {
        $produto = $this->model->newQuery()->findOrFail($id);
        $produto->update(['foto_path' => $fotoPath]);

        return $produto;
    }

    public function salvarArquivoFoto(UploadedFile $foto, int $usuarioId): string
    {
        return $foto->store('produtos/'.$usuarioId, Produto::discoFotos());
    }

    public function apagarArquivoFoto(string $fotoPath): void
    {
        Storage::disk(Produto::discoFotos())->delete($fotoPath);
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
