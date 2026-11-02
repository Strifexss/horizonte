<?php

namespace App\Repositories\Interfaces;

use App\DTO\ClienteSearchDTO;
use App\Models\Cliente;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ClienteRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * CONSUMIDOR primeiro, depois os clientes da Empresa ativa.
     */
    public function indexFiltrado(ClienteSearchDTO $filters): LengthAwarePaginator;

    /**
     * Cliente da Empresa ativa (sem o CONSUMIDOR).
     */
    public function findDaEmpresa(int $id): Cliente;

    /**
     * Cliente da Empresa ativa ou o CONSUMIDOR.
     */
    public function findVisivel(int $id): Cliente;

    /**
     * Clientes ativos visíveis por nome, telefone ou documento, CONSUMIDOR primeiro.
     *
     * @return Collection<int, Cliente>
     */
    public function autocompleteAtivos(?string $q = null): Collection;

    public function countVendas(int $clienteId): int;
}
