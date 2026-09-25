<?php

namespace App\Http\Controllers;

use App\DTO\FinanceiroDTO;
use App\DTO\FinanceiroSearchDTO;
use App\Http\Requests\FinanceiroRequest;
use App\Http\Requests\FinanceiroSearchRequest;
use App\Http\Resources\FinanceiroParcelaResource;
use App\Services\Interfaces\CategoriaServiceInterface;
use App\Services\Interfaces\ExtratoServiceInterface;
use App\Services\Interfaces\ProdutosServiceInterface;
use Inertia\Inertia;

class ExtratoController extends FinanceiroAbstractController
{
    public function __construct(
        private CategoriaServiceInterface $categoriaService,
        private ExtratoServiceInterface $extratoService,
        private ProdutosServiceInterface $produtosService
    ) {}

    public function index(FinanceiroSearchRequest $request)
    {
        $filters = FinanceiroSearchDTO::fromArray($request->validated());

        return Inertia::render('extrato/index', [
            'filters' => $filters->all(),
            'categorias' => Inertia::lazy(fn () => $this->categoriaService->index()),
            'produtos' => Inertia::lazy(fn () => $this->produtosService->index()),
            'parcelas' => Inertia::defer(fn () => FinanceiroParcelaResource::collection($this->extratoService->index($filters))),
        ]);
    }

    public function store(FinanceiroRequest $request)
    {
        try {
            $dto = FinanceiroDTO::fromArray($request->validated());
            $this->extratoService->store($dto);

            return redirect()->route('extrato.index')->with('success', 'Lançamento criado.');
        } catch (\Exception $e) {
            return redirect()->route('extrato.index')->with('error', 'Erro ao criar lançamento: '.$e->getMessage());
        }
    }

    public function show(int $id)
    {
        return $this->extratoService->show($id);
    }

    public function update(FinanceiroRequest $request, int $id)
    {
        try {
            $dto = FinanceiroDTO::fromArray($request->validated());
            $this->extratoService->storeParcelas($dto);

            return redirect()->route('extrato.index')->with('success', 'Lançamento atualizado.');
        } catch (\Exception $e) {
            return redirect()->route('extrato.index')->with('error', 'Erro ao atualizar lançamento: '.$e->getMessage());
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->extratoService->delete($id);

            return redirect()->route('extrato.index')->with('success', 'Lançamento removido.');
        } catch (\Exception $e) {
            return redirect()->route('extrato.index')->with('error', 'Erro ao remover lançamento: '.$e->getMessage());
        }
    }
}
