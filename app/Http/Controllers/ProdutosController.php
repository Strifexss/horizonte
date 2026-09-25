<?php

namespace App\Http\Controllers;

use App\DTO\ProdutoDTO;
use App\Http\Requests\StoreProdutoRequest;
use App\Services\Interfaces\ProdutosServiceInterface;
use Illuminate\Http\Request;

class ProdutosController extends Controller
{
    public function __construct(
        private ProdutosServiceInterface $produtosService
    ) {}

    public function index()
    {
        return response()->json([
            'produtos' => $this->produtosService->index(),
        ]);
    }

    public function store(StoreProdutoRequest $request)
    {
        try {
            $produto = $this->produtosService->store(
                ProdutoDTO::fromArray($request->validated())
            );

            return redirect()
                ->route('extrato.index')
                ->with('success', 'Produto criado com sucesso.')
                ->with('produto_criado', [
                    'id' => $produto->id,
                    'nome' => $produto->nome,
                    'preco_compra' => $produto->preco_compra,
                ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao criar produto: '.$e->getMessage());
        }
    }

    public function update(StoreProdutoRequest $request, $id)
    {
        try {
            $this->produtosService->update(
                $id,
                ProdutoDTO::fromArray($request->validated())
            );

            return redirect()->route('extrato.index')->with('success', 'Produto atualizado com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar produto: '.$e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $this->produtosService->delete($id);

            return redirect()->route('extrato.index')->with('success', 'Produto excluído com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir produto: '.$e->getMessage());
        }
    }

    public function autocomplete(Request $request)
    {
        $q = (string) $request->query('q', '');
        $result = $this->produtosService->autocomplete($q);

        return response()->json($result);
    }
}
