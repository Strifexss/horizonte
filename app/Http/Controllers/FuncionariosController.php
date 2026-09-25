<?php

namespace App\Http\Controllers;

use App\DTO\FuncionarioDTO;
use App\Http\Requests\StoreFuncionarioRequest;
use App\Services\Interfaces\FuncionariosServiceInterface;
use Illuminate\Http\Request;

class FuncionariosController extends Controller
{
    public function __construct(
        private FuncionariosServiceInterface $funcionariosService
    ) {}

    public function index()
    {
        return response()->json([
            'funcionarios' => $this->funcionariosService->index(),
        ]);
    }

    public function store(StoreFuncionarioRequest $request)
    {
        try {
            $funcionario = $this->funcionariosService->store(
                FuncionarioDTO::fromArray($request->validated())
            );

            return redirect()
                ->route('extrato.index')
                ->with('success', 'Funcionário criado com sucesso.')
                ->with('funcionario_criado', [
                    'id' => $funcionario->id,
                    'nome' => $funcionario->nome,
                    'salario' => $funcionario->salario,
                ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao criar funcionário: '.$e->getMessage());
        }
    }

    public function update(StoreFuncionarioRequest $request, $id)
    {
        try {
            $this->funcionariosService->update(
                $id,
                FuncionarioDTO::fromArray($request->validated())
            );

            return redirect()->route('extrato.index')->with('success', 'Funcionário atualizado com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar funcionário: '.$e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $this->funcionariosService->delete($id);

            return redirect()->route('extrato.index')->with('success', 'Funcionário excluído com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir funcionário: '.$e->getMessage());
        }
    }

    public function autocomplete(Request $request)
    {
        $q = (string) $request->query('q', '');
        $result = $this->funcionariosService->autocomplete($q);

        return response()->json($result);
    }
}
