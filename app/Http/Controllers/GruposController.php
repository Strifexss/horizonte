<?php

namespace App\Http\Controllers;

use App\DTO\GrupoDTO;
use App\Http\Requests\StoreGrupoRequest;
use App\Services\Interfaces\GruposServiceInterface;
use Illuminate\Http\Request;

class GruposController extends Controller
{
    public function __construct(
        private GruposServiceInterface $gruposService
    ) {}

    public function index()
    {
        return response()->json([
            'grupos' => $this->gruposService->index(),
        ]);
    }

    public function autocomplete(Request $request)
    {
        $q = (string) $request->query('q', '');
        $result = $this->gruposService->autocomplete($q);
        return response()->json($result);
    }

    public function store(StoreGrupoRequest $request)
    {
        try {
            $grupo = $this->gruposService->store(
                GrupoDTO::fromArray($request->validated())
            );
            return redirect()
                ->route('extrato.index')
                ->with('success', 'Grupo criado com sucesso.')
                ->with('grupo_criado', [
                    'id' => $grupo->id,
                    'nome' => $grupo->nome,
                ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao criar grupo: '.$e->getMessage());
        }
    }

    public function update(StoreGrupoRequest $request, $id)
    {
        try {
            $this->gruposService->update(
                (int) $id,
                GrupoDTO::fromArray($request->validated())
            );
            return redirect()->route('extrato.index')->with('success', 'Grupo atualizado com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar grupo: '.$e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $this->gruposService->delete((int) $id);
            return redirect()->route('extrato.index')->with('success', 'Grupo excluído com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir grupo: '.$e->getMessage());
        }
    }
}
