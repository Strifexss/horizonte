<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Services\Interfaces\CategoriaServiceInterface;
use App\Services\Interfaces\ExtratoServiceInterface;
use App\Http\Requests\FinanceiroRequest;
use App\DTO\FinanceiroDTO;
use App\Http\Resources\FinanceiroParcelaResource;

class ExtratoController extends FinanceiroAbstractController
{
    public function __construct(
        private CategoriaServiceInterface $categoriaService,
        private ExtratoServiceInterface $extratoService
    ) {}

    public function index()
    {
        return Inertia::render('extrato/index', [
            'categorias' => Inertia::lazy(fn () => $this->categoriaService->index()),
            'parcelas' => Inertia::defer(fn () => FinanceiroParcelaResource::collection($this->extratoService->index())),
        ]);
    }

    public function store(FinanceiroRequest $request)
    {
        try {
            $dto = FinanceiroDTO::fromArray($request->validated());
            $this->extratoService->store($dto);
            return redirect()->route('extrato.index')->with('success', 'Lançamento criado.');
        } catch (\Exception $e) {
            return redirect()->route('extrato.index')->with('error', 'Erro ao criar lançamento: ' . $e->getMessage());
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
            $this->extratoService->update($id, $dto);
            return redirect()->route('extrato.index')->with('success', 'Lançamento atualizado.');
        } catch (\Exception $e) {
            return redirect()->route('extrato.index')->with('error', 'Erro ao atualizar lançamento: ' . $e->getMessage());
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->extratoService->delete($id);
            return redirect()->route('extrato.index')->with('success', 'Lançamento removido.');
        } catch (\Exception $e) {
            return redirect()->route('extrato.index')->with('error', 'Erro ao remover lançamento: ' . $e->getMessage());
        }
    }
}

