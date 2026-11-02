<?php

namespace App\Repositories;

use App\DTO\ClienteSearchDTO;
use App\Models\Cliente;
use App\Models\Empresa;
use App\Models\Venda;
use App\Repositories\Interfaces\ClienteRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ClienteRepository extends AbstractRepository implements ClienteRepositoryInterface
{
    public function __construct(Cliente $cliente)
    {
        parent::__construct($cliente);
    }

    public function indexFiltrado(ClienteSearchDTO $filters): LengthAwarePaginator
    {
        $query = $this->visiveisQuery();

        if ($filters->busca !== null) {
            $this->aplicarBusca($query, $filters->busca);
        }

        return $query
            ->orderByRaw('case when empresa_id is null then 0 else 1 end')
            ->orderBy($filters->sort ?? 'nome', $filters->sort_dir ?? 'asc')
            ->orderBy('id')
            ->paginate($filters->per_page, ['*'], 'page', $filters->page);
    }

    public function findDaEmpresa(int $id): Cliente
    {
        return $this->model->newQuery()
            ->where('empresa_id', Empresa::atualId())
            ->findOrFail($id);
    }

    public function findVisivel(int $id): Cliente
    {
        return $this->visiveisQuery()->findOrFail($id);
    }

    public function autocompleteAtivos(?string $q = null): Collection
    {
        $query = $this->visiveisQuery()->where('ativo', true);

        $q = trim((string) $q);
        if ($q !== '') {
            $this->aplicarBusca($query, $q);
        }

        return $query
            ->orderByRaw('case when empresa_id is null then 0 else 1 end')
            ->orderBy('nome')
            ->limit(20)
            ->get(['id', 'nome', 'telefone', 'documento', 'empresa_id']);
    }

    public function countVendas(int $clienteId): int
    {
        return Venda::query()->where('cliente_id', $clienteId)->count();
    }

    /**
     * @return Builder<Cliente>
     */
    private function visiveisQuery(): Builder
    {
        return $this->model->newQuery()->where(function (Builder $query): void {
            $query->whereNull('empresa_id')->orWhere('empresa_id', Empresa::atualId());
        });
    }

    /**
     * Nome sem acento, telefone ou documento.
     *
     * @param  Builder<Cliente>  $query
     */
    private function aplicarBusca(Builder $query, string $termo): void
    {
        $query->where(function (Builder $busca) use ($termo): void {
            $this->applyAccentInsensitiveLike($busca, 'nome', $termo);
            $busca->orWhere('telefone', 'like', '%'.$termo.'%')
                ->orWhere('documento', 'like', '%'.$termo.'%');
        });
    }
}
