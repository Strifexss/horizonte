<?php

namespace App\Http\Controllers;

use App\DTO\CategoriaDTO;
use App\Http\Requests\StoreCategoriaRequest;
use App\Services\Interfaces\CategoriaServiceInterface;
use Inertia\Inertia;

class CategoriaController extends Controller
{
    public function __construct(
        private CategoriaServiceInterface $categoriaService
    ) {}

    public function index()
    {
        return Inertia::render('categorias/index', [
            'categorias' => Inertia::defer(fn () => $this->categoriaService->index()),
        ]);
    }

    public function store(StoreCategoriaRequest $request)
    {
        try {
            $dto = CategoriaDTO::fromArray($request->validated());
            $this->categoriaService->store($dto);

            return redirect()->route('categorias')->with('success', 'Categoria criada com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao criar categoria: ' . $e->getMessage());
        }
    }

    public function update(StoreCategoriaRequest $request, $id)
    {
        try {
            $dto = CategoriaDTO::fromArray($request->validated());
            $this->categoriaService->update($id, $dto);

            return redirect()->route('categorias')->with('success', 'Categoria atualizada com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar categoria: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $this->categoriaService->delete($id);
            return redirect()->route('categorias')->with('success', 'Categoria excluída com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir categoria: ' . $e->getMessage());
        }
    }
}
