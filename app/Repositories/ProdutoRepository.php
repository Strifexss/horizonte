<?php

namespace App\Repositories;

use App\DTO\ProdutoSearchDTO;
use App\Models\Empresa;
use App\Models\FinanceiroParcela;
use App\Models\Produto;
use App\Models\VendaItem;
use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProdutoRepository extends AbstractRepository implements ProdutoRepositoryInterface
{
    private const CATALOGO_POR_PAGINA = 20;

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
            $query->where('empresa_id', Empresa::atualId());
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
            $query->where('empresa_id', Empresa::atualId());
        }

        return $query->with('fornecedor', 'grupo')->orderBy('nome')->get();
    }

    public function indexFiltrado(ProdutoSearchDTO $filters): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        if (Auth::check()) {
            $query->where('empresa_id', Empresa::atualId());
        }

        if ($filters->busca) {
            $this->aplicarBuscaPorNomeOuCodigo($query, $filters->busca);
        }

        $sort = $filters->sort ?? 'nome';
        $allowed = ['nome', 'codigo', 'preco_compra', 'preco_venda', 'ativo', 'favorito'];
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

    public function findManyDaEmpresa(array $ids): Collection
    {
        return $this->model->newQuery()
            ->where('empresa_id', Empresa::atualId())
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id');
    }

    public function autocompleteParaVenda(?string $q = null): Collection
    {
        $query = $this->model->newQuery()
            ->where('empresa_id', Empresa::atualId())
            ->where('ativo', true)
            ->with('grupo:id,nome');

        $q = trim((string) $q);

        if ($q !== '') {
            $this->aplicarBuscaPorNomeOuCodigo($query, $q);
            $query->orderByRaw('case when codigo = ? then 0 else 1 end', [$q]);
        }

        return $query
            ->orderBy('nome')
            ->limit(20)
            ->get(['id', 'nome', 'codigo', 'preco_venda', 'grupo_id', 'foto_path', 'descricao', 'favorito']);
    }

    public function catalogoParaVenda(?string $q, ?int $grupoId, bool $soFavoritos, int $page): Paginator
    {
        $query = $this->model->newQuery()
            ->where('empresa_id', Empresa::atualId())
            ->where('ativo', true)
            ->with('grupo:id,nome');

        $q = trim((string) $q);
        if ($q !== '') {
            $this->aplicarBuscaPorNomeOuCodigo($query, $q);
            $query->orderByRaw('case when codigo = ? then 0 else 1 end', [$q]);
        } elseif ($soFavoritos) {
            $query->where('favorito', true);
        } elseif ($grupoId !== null) {
            $query->where('grupo_id', $grupoId);
        }

        return $query
            ->orderBy('nome')
            ->orderBy('id')
            ->simplePaginate(self::CATALOGO_POR_PAGINA, ['id', 'nome', 'codigo', 'preco_venda', 'grupo_id', 'foto_path'], 'page', $page);
    }

    public function favoritosParaVenda(): Collection
    {
        return $this->model->newQuery()
            ->where('empresa_id', Empresa::atualId())
            ->where('ativo', true)
            ->where('favorito', true)
            ->orderBy('nome')
            ->get(['id', 'nome', 'codigo', 'preco_venda']);
    }

    public function atualizarPrecoDeVenda(int $id, float $precoVenda): void
    {
        $this->findDaEmpresa($id)->update(['preco_venda' => $precoVenda]);
    }

    public function marcarFavorito(int $id, bool $favorito): Produto
    {
        $produto = $this->findDaEmpresa($id);
        $produto->update(['favorito' => $favorito]);

        return $produto;
    }

    /**
     * Nome sem acento ou parte do código comercial.
     *
     * @param  Builder<Produto>  $query
     */
    private function aplicarBuscaPorNomeOuCodigo(Builder $query, string $termo): void
    {
        $query->where(function (Builder $busca) use ($termo): void {
            $this->applyAccentInsensitiveLike($busca, 'nome', $termo);
            $busca->orWhere('codigo', 'like', '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $termo).'%');
        });
    }

    public function ativosDaEmpresa(int $empresaId): Collection
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->where('ativo', true)
            ->with('grupo')
            ->orderBy('nome')
            ->get();
    }

    public function existeNaEmpresa(int $empresaId): bool
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->exists();
    }

    public function ativosComPrecoDeVendaSuspeito(int $empresaId): Collection
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
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

    public function salvarArquivoFoto(UploadedFile $foto, int $empresaId): string
    {
        return $foto->store('produtos/'.$empresaId, Produto::discoFotos());
    }

    public function apagarArquivoFoto(string $fotoPath): void
    {
        Storage::disk(Produto::discoFotos())->delete($fotoPath);
    }

    /**
     * Garante que o produto pertence ao usuário autenticado.
     */
    public function findDaEmpresa(int $id): Produto
    {
        return $this->model->newQuery()
            ->where('empresa_id', Empresa::atualId())
            ->findOrFail($id);
    }

    /**
     * Conta quantos produtos pertencem ao usuário informado.
     */
    public function countByEmpresa(int $empresaId): int
    {
        return $this->model->newQuery()->where('empresa_id', $empresaId)->count();
    }

    /**
     * Retorna todos os produtos do usuário (coleção).
     *
     * @return Collection<int, Produto>
     */
    public function getByEmpresa(int $empresaId): mixed
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->with('fornecedor', 'grupo')
            ->orderBy('id')
            ->get();
    }
}
