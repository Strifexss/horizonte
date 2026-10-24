<?php

namespace App\Http\Controllers;

use App\DTO\FormaPagamentoDTO;
use App\Exceptions\FormaPagamentoEmUsoException;
use App\Http\Requests\StoreFormaPagamentoRequest;
use App\Http\Resources\FormaPagamentoResource;
use App\Services\Interfaces\FormasPagamentoServiceInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormasPagamentoController extends Controller
{
    public function __construct(
        private FormasPagamentoServiceInterface $formasPagamentoService
    ) {}

    public function index()
    {
        return Inertia::render('formas-pagamento/index', [
            'formas_pagamento' => Inertia::defer(
                fn () => FormaPagamentoResource::collection($this->formasPagamentoService->index())
            ),
        ]);
    }

    public function store(StoreFormaPagamentoRequest $request)
    {
        try {
            $forma = $this->formasPagamentoService->store(FormaPagamentoDTO::fromArray($request->validated()));

            return redirect()->back()
                ->with('success', 'Forma de pagamento criada com sucesso.')
                ->with('forma_pagamento_criada', (new FormaPagamentoResource($forma))->resolve($request));
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao criar forma de pagamento: '.$e->getMessage());
        }
    }

    public function update(StoreFormaPagamentoRequest $request, int $id)
    {
        try {
            $this->formasPagamentoService->update($id, FormaPagamentoDTO::fromArray($request->validated()));

            return redirect()->route('formas-pagamento')->with('success', 'Forma de pagamento atualizada com sucesso.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->formasPagamentoService->delete($id);

            return redirect()->route('formas-pagamento')->with('success', 'Forma de pagamento excluída com sucesso.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (FormaPagamentoEmUsoException|\DomainException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir forma de pagamento: '.$e->getMessage());
        }
    }

    public function autocomplete(Request $request)
    {
        return response()->json(
            $this->formasPagamentoService->autocomplete((string) $request->query('q', ''))
        );
    }
}
