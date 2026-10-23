<?php

namespace App\Http\Controllers;

use App\DTO\FornecedorDTO;
use App\Http\Requests\StoreFornecedorRequest;
use App\Services\Interfaces\FornecedoresServiceInterface;
use Illuminate\Http\Request;

class FornecedoresController extends Controller
{
    public function __construct(
        private FornecedoresServiceInterface $fornecedoresService
    ) {}

    public function index()
    {
        return response()->json([
            'fornecedores' => $this->fornecedoresService->index(),
        ]);
    }

    public function store(StoreFornecedorRequest $request)
    {
        try {
            $fornecedor = $this->fornecedoresService->store(
                FornecedorDTO::fromArray($request->validated())
            );

            return $this->redirectAfterWrite('Fornecedor criado com sucesso.')
                ->with('fornecedor_criado', [
                    'id' => $fornecedor->id,
                    'nome' => $fornecedor->nome,
                ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao criar fornecedor: '.$e->getMessage());
        }
    }

    public function update(StoreFornecedorRequest $request, $id)
    {
        try {
            $this->fornecedoresService->update(
                $id,
                FornecedorDTO::fromArray($request->validated())
            );

            return $this->redirectAfterWrite('Fornecedor atualizado com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar fornecedor: '.$e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $this->fornecedoresService->delete($id);

            return $this->redirectAfterWrite('Fornecedor excluído com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir fornecedor: '.$e->getMessage());
        }
    }

    private function redirectAfterWrite(string $message)
    {
        $previous = (string) url()->previous();
        $route = str_contains($previous, '/produtos') ? 'produtos' : 'extrato.index';

        return redirect()->route($route)->with('success', $message);
    }

    public function autocomplete(Request $request)
    {
        $q = (string) $request->query('q', '');
        $result = $this->fornecedoresService->autocomplete($q);

        return response()->json($result);
    }
}
