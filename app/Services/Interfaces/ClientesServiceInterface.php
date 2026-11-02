<?php

namespace App\Services\Interfaces;

use App\DTO\ClienteDTO;
use App\DTO\ClienteSearchDTO;
use App\Models\Cliente;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ClientesServiceInterface
{
    public function indexFiltrado(ClienteSearchDTO $filters): LengthAwarePaginator;

    public function cadastrar(ClienteDTO $dados): Cliente;

    /**
     * Altera um cliente da Empresa; o CONSUMIDOR não pode ser alterado.
     */
    public function alterar(int $id, ClienteDTO $dados): Cliente;

    /**
     * Exclui um cliente da Empresa sem vendas; o CONSUMIDOR não pode ser excluído.
     */
    public function excluir(int $id): void;

    /**
     * @return Collection<int, Cliente>
     */
    public function autocomplete(?string $q = null): Collection;
}
