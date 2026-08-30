<?php

namespace App\Http\Controllers;

use App\DTO\CategoriaDTO;
use App\Http\Requests\StoreCategoriaRequest;
use App\Services\Interfaces\CategoriaServiceInterface;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function __construct(
        private CategoriaServiceInterface $categoriaService
    ) {}

    public function index()
    {
        return response()->json([
            'categorias' => $this->categoriaService->index(),
        ]);
    }

    public function store(StoreCategoriaRequest $request)
    {
        try {
            $dto = CategoriaDTO::fromArray($request->validated());
            $this->categoriaService->store($dto);
            return redirect()->route('extrato.index')->with('success', 'Categoria criada com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao criar categoria: ' . $e->getMessage());
        }
    }

    public function update(StoreCategoriaRequest $request, $id)
    {
        try {
            $dto = CategoriaDTO::fromArray($request->validated());
            $this->categoriaService->update($id, $dto);

            return redirect()->route('extrato.index')->with('success', 'Categoria atualizada com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar categoria: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $this->categoriaService->delete($id);
            return redirect()->route('extrato.index')->with('success', 'Categoria excluída com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir categoria: ' . $e->getMessage());
        }
    }

    public function autocomplete(Request $request)
    {
        $q = (string) $request->query('q', '');
        $result = $this->categoriaService->autocomplete($q);

        return response()->json($result);
    }
}
