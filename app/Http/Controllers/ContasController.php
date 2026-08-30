<?php

namespace App\Http\Controllers;

use App\DTO\ContaDTO;
use App\Http\Requests\StoreContaRequest;
use App\Services\Interfaces\ContasServiceInterface;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ContasController extends Controller
{
    public function __construct(
        private ContasServiceInterface $contasService
    ){}

    public function index()
    {
        return Inertia::render('contas/index', [
            'contas' => Inertia::defer(fn () => $this->contasService->index()),
        ]);
    }

    public function store(StoreContaRequest $request)
    {
        try {
            $this->contasService->store(
                ContaDTO::fromArray($request->validated())
            );

            return redirect()->route('contas')->with('success', 'Conta criada com sucesso.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao criar conta: ' . $e->getMessage());
        }
    }
    
    public function update(StoreContaRequest $request, $id)
    {
        try {
            $dto = ContaDTO::fromArray($request->validated());
            $this->contasService->update($id, $dto);

            return redirect()->route('contas')->with('success', 'Conta atualizada com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar conta: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $this->contasService->delete($id);
            return redirect()->route('contas')->with('success', 'Conta excluída com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir conta: ' . $e->getMessage());
        }
    }
    
    public function autocomplete(Request $request)
    {
        $q = (string) $request->query('q', '');
        $result = $this->contasService->autocomplete($q);

        return response()->json($result);
    }
}
