<?php

namespace App\Http\Controllers;

use App\DTO\ProdutoDTO;
use App\DTO\ProdutoSearchDTO;
use App\Exceptions\ProdutoEmUsoException;
use App\Http\Requests\ProdutoFotoRequest;
use App\Http\Requests\ProdutoSearchRequest;
use App\Http\Requests\StoreProdutoRequest;
use App\Http\Resources\ProdutoAutocompleteResource;
use App\Http\Resources\ProdutoResource;
use App\Services\Interfaces\FornecedoresServiceInterface;
use App\Services\Interfaces\GruposServiceInterface;
use App\Services\Interfaces\ProdutosServiceInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdutosController extends Controller
{
    public function __construct(
        private ProdutosServiceInterface $produtosService,
        private FornecedoresServiceInterface $fornecedoresService,
        private GruposServiceInterface $gruposService,
    ) {}

    public function index(ProdutoSearchRequest $request)
    {
        $filters = ProdutoSearchDTO::fromArray($request->validated());

        return Inertia::render('produtos/index', [
            'filters' => $filters->all(),
            'produtos' => Inertia::defer(
                fn () => ProdutoResource::collection($this->produtosService->indexFiltrado($filters))
            ),
            'fornecedores' => Inertia::lazy(fn () => $this->fornecedoresService->index()),
            'grupos' => Inertia::lazy(fn () => $this->gruposService->index()),
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

    public function fotoStore(ProdutoFotoRequest $request, int $id): RedirectResponse
    {
        try {
            $this->produtosService->salvarFoto($id, $request->file('foto'));

            return redirect()->back()->with('success', 'Foto do produto salva.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao salvar foto: '.$e->getMessage());
        }
    }

    public function fotoDestroy(int $id): RedirectResponse
    {
        try {
            $this->produtosService->removerFoto($id);

            return redirect()->back()->with('success', 'Foto do produto removida.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao remover foto: '.$e->getMessage());
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
