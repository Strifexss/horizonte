<?php

namespace App\Http\Controllers;

use App\DTO\ProdutoDTO;
use App\DTO\ProdutoSearchDTO;
use App\Exceptions\ProdutoEmUsoException;
use App\Http\Requests\ProdutoSearchRequest;
use App\Http\Requests\StoreProdutoRequest;
use App\Http\Resources\ProdutoAutocompleteResource;
use App\Http\Resources\ProdutoResource;
use App\Services\Interfaces\ProdutosServiceInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdutosController extends Controller
{
    public function __construct(
        private ProdutosServiceInterface $produtosService
    ) {}

    public function index(ProdutoSearchRequest $request)
    {
        $filters = ProdutoSearchDTO::fromArray($request->validated());

        return Inertia::render('produtos/index', [
            'filters' => $filters->all(),
            'produtos' => Inertia::defer(
                fn () => ProdutoResource::collection($this->produtosService->indexFiltrado($filters))
            ),
        ]);
    }

    public function store(StoreProdutoRequest $request)
    {
        try {
            $produto = $this->produtosService->store(
                ProdutoDTO::fromArray($request->validated())
            );

            return $this->redirectAfterWrite($request, 'Produto criado com sucesso.')
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

            return $this->redirectAfterWrite($request, 'Produto atualizado com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar produto: '.$e->getMessage());
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $this->produtosService->delete($id);

            return $this->redirectAfterWrite($request, 'Produto excluído com sucesso.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (ProdutoEmUsoException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir produto: '.$e->getMessage());
        }
    }

    public function autocomplete(Request $request)
    {
        $q = (string) $request->query('q', '');
        $result = $this->produtosService->autocomplete($q);
        $resource = ProdutoAutocompleteResource::collection($result);
        $data = $resource->response()->getData(true);

        return response()->json($data['data'] ?? []);
    }

    private function redirectAfterWrite(Request $request, string $message)
    {
        $previous = (string) url()->previous();
        $route = str_contains($previous, '/produtos') ? 'produtos' : 'extrato.index';

        return redirect()->route($route)->with('success', $message);
    }
}
