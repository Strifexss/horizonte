<?php

namespace App\Http\Controllers;

use App\DTO\ClienteDTO;
use App\DTO\ClienteSearchDTO;
use App\Exceptions\ClienteInalteravelException;
use App\Http\Requests\ClienteSearchRequest;
use App\Http\Requests\StoreClienteRequest;
use App\Http\Resources\ClienteResource;
use App\Services\Interfaces\ClientesServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientesController extends Controller
{
    public function __construct(
        private ClientesServiceInterface $clientesService,
    ) {}

    public function index(ClienteSearchRequest $request): Response
    {
        $filters = ClienteSearchDTO::fromArray($request->validated());

        return Inertia::render('clientes/index', [
            'filters' => $filters->all(),
            'clientes' => Inertia::defer(
                fn () => ClienteResource::collection($this->clientesService->indexFiltrado($filters))
            ),
        ]);
    }

    public function store(StoreClienteRequest $request): RedirectResponse
    {
        $cliente = $this->clientesService->cadastrar(ClienteDTO::fromArray($request->validated()));

        return redirect()->back()
            ->with('success', 'Cliente cadastrado com sucesso.')
            ->with('cliente_criado', ['id' => $cliente->id, 'nome' => $cliente->nome]);
    }

    public function update(StoreClienteRequest $request, int $id): RedirectResponse
    {
        try {
            $this->clientesService->alterar($id, ClienteDTO::fromArray($request->validated()));

            return redirect()->back()->with('success', 'Cliente atualizado com sucesso.');
        } catch (ClienteInalteravelException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->clientesService->excluir($id);

            return redirect()->back()->with('success', 'Cliente excluído com sucesso.');
        } catch (ClienteInalteravelException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function autocomplete(Request $request): JsonResponse
    {
        return response()->json(
            ClienteResource::collection($this->clientesService->autocomplete((string) $request->query('q', '')))
        );
    }
}
