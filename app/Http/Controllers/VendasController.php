<?php

namespace App\Http\Controllers;

use App\DTO\VendaDTO;
use App\DTO\VendaSearchDTO;
use App\Exceptions\VendaInvalidaException;
use App\Http\Requests\StoreVendaRequest;
use App\Http\Requests\VendaSearchRequest;
use App\Http\Resources\FormaPagamentoResource;
use App\Http\Resources\VendaResource;
use App\Models\Venda;
use App\Services\Interfaces\ContasServiceInterface;
use App\Services\Interfaces\FormasPagamentoServiceInterface;
use App\Services\Interfaces\VendasServiceInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendasController extends Controller
{
    public function __construct(
        private VendasServiceInterface $vendasService,
        private FormasPagamentoServiceInterface $formasPagamentoService,
        private ContasServiceInterface $contasService,
    ) {}

    public function index(VendaSearchRequest $request)
    {
        $filters = VendaSearchDTO::fromArray($request->validated());

        return Inertia::render('vendas/index', [
            'filters' => $filters->all(),
            'formas_pagamento' => FormaPagamentoResource::collection($this->formasPagamentoService->index()),
            'possui_conta' => $this->contasService->index()->isNotEmpty(),
            'vendas' => Inertia::defer(
                fn () => VendaResource::collection($this->vendasService->indexFiltrado($filters))
            ),
        ]);
    }

    public function store(StoreVendaRequest $request)
    {
        return $this->salvar(fn () => $this->vendasService->store(VendaDTO::fromArray($request->validated())));
    }

    public function update(StoreVendaRequest $request, int $id)
    {
        return $this->salvar(fn () => $this->vendasService->update($id, VendaDTO::fromArray($request->validated())));
    }

    public function cancelar(int $id)
    {
        try {
            $this->vendasService->cancelar($id);

            return redirect()->route('vendas')->with('success', "Venda #{$id} cancelada.");
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (VendaInvalidaException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao cancelar venda: '.$e->getMessage());
        }
    }

    public function produtosAutocomplete(Request $request)
    {
        return response()->json(
            $this->vendasService->produtosParaVenda((string) $request->query('q', ''))
        );
    }

    /**
     * @param  callable(): Venda  $salvar
     */
    private function salvar(callable $salvar): RedirectResponse
    {
        try {
            $venda = $salvar();

            $mensagem = $venda->status === Venda::STATUS_FECHADA
                ? "Venda #{$venda->id} fechada."
                : "Venda #{$venda->id} salva em aberto.";

            return redirect()->route('vendas')->with('success', $mensagem);
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (VendaInvalidaException $e) {
            return redirect()->back()->withErrors([$e->campo => $e->getMessage()]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao salvar venda: '.$e->getMessage());
        }
    }
}
