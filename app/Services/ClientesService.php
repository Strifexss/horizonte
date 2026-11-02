<?php

namespace App\Services;

use App\DTO\ClienteDTO;
use App\DTO\ClienteSearchDTO;
use App\Exceptions\ClienteInalteravelException;
use App\Models\Cliente;
use App\Repositories\Interfaces\ClienteRepositoryInterface;
use App\Services\Interfaces\ClientesServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ClientesService implements ClientesServiceInterface
{
    public function __construct(
        private ClienteRepositoryInterface $clienteRepository,
    ) {}

    public function indexFiltrado(ClienteSearchDTO $filters): LengthAwarePaginator
    {
        return $this->clienteRepository->indexFiltrado($filters);
    }

    public function cadastrar(ClienteDTO $dados): Cliente
    {
        return $this->clienteRepository->store($dados->paraGravar());
    }

    public function alterar(int $id, ClienteDTO $dados): Cliente
    {
        $cliente = $this->clienteDaEmpresa($id);
        $cliente->update(collect($dados->paraGravar())->except('usuario_id')->all());

        return $cliente;
    }

    public function excluir(int $id): void
    {
        $cliente = $this->clienteDaEmpresa($id);

        if ($this->clienteRepository->countVendas($cliente->id) > 0) {
            throw ClienteInalteravelException::emUso();
        }

        $cliente->delete();
    }

    public function autocomplete(?string $q = null): Collection
    {
        return $this->clienteRepository->autocompleteAtivos($q);
    }

    /**
     * O CONSUMIDOR é visível mas nunca alterável: responde com a regra em vez de 404.
     */
    private function clienteDaEmpresa(int $id): Cliente
    {
        if ($this->clienteRepository->findVisivel($id)->ehPadrao()) {
            throw ClienteInalteravelException::consumidor();
        }

        return $this->clienteRepository->findDaEmpresa($id);
    }
}
