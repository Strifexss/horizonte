<?php

namespace App\Http\Controllers;

use App\DTO\VendaDTO;
use App\DTO\VendaSearchDTO;
use App\Exceptions\VendaInvalidaException;
use App\Http\Requests\StoreVendaRequest;
use App\Http\Requests\VendaSearchRequest;
use App\Http\Resources\FormaPagamentoResource;
use App\Http\Resources\VendaResource;
use App\Models\Cliente;
use App\Models\Grupo;
use App\Models\Produto;
use App\Models\Venda;
use App\Services\Interfaces\ContasServiceInterface;
use App\Services\Interfaces\FormasPagamentoServiceInterface;
use App\Services\Interfaces\GruposServiceInterface;
use App\Services\Interfaces\VendasServiceInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendasController extends Controller
{
    public function __construct(
        private VendasServiceInterface $vendasService,
        private FormasPagamentoServiceInterface $formasPagamentoService,
        private ContasServiceInterface $contasService,
        private GruposServiceInterface $gruposService,
    ) {}

    public function index(VendaSearchRequest $request)
    {
        $filters = VendaSearchDTO::fromArray($request->validated());

        return Inertia::render('vendas/index', [
            'filters' => $filters->all(),
            'formas_pagamento' => FormaPagamentoResource::collection($this->formasPagamentoService->index()),
            'cliente_padrao' => ['id' => Cliente::consumidorId(), 'nome' => Cliente::NOME_CONSUMIDOR],
            'grupos' => $this->gruposService->index()->map(fn (Grupo $grupo): array => ['id' => $grupo->id, 'nome' => $grupo->nome])->values(),
            'produtos_favoritos' => $this->vendasService->favoritosParaVenda(),
            'possui_conta' => $this->contasService->index()->isNotEmpty(),
            'resumo' => Inertia::defer(fn () => ['counts' => $this->vendasService->contagemPorStatus($filters)]),
            'vendas' => Inertia::defer(
                fn () => VendaResource::collection($this->vendasService->indexFiltrado($filters))
            ),
        ]);
    }

    public function store(StoreVendaRequest $request)
    {
        return $this->salvar(fn () => $this->vendasService->store(VendaDTO::fromArray($request->validated())));
    }

    public function update(StoreVendaRequest $request, int $id)
    {
        return $this->salvar(fn () => $this->vendasService->update($id, VendaDTO::fromArray($request->validated())));
    }

    public function cancelar(int $id)
    {
        try {
            $this->vendasService->cancelar($id);

            return redirect()->route('vendas')->with('success', "Venda #{$id} cancelada.");
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (VendaInvalidaException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao cancelar venda: '.$e->getMessage());
        }
    }

    public function catalogo(Request $request): JsonResponse
    {
        $filtros = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'grupo_id' => ['nullable', 'integer'],
            'favoritos' => ['nullable', 'boolean'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $pagina = $this->vendasService->catalogoParaVenda(
            $filtros['q'] ?? null,
            isset($filtros['grupo_id']) ? (int) $filtros['grupo_id'] : null,
            (bool) ($filtros['favoritos'] ?? false),
            (int) ($filtros['page'] ?? 1),
        );

        return response()->json([
            'data' => collect($pagina->items())->map(fn (Produto $produto): array => [
                'id' => $produto->id,
                'nome' => $produto->nome,
                'codigo' => $produto->codigo,
                'preco_venda' => number_format((float) $produto->preco_venda, 2, '.', ''),
                'grupo' => $produto->grupo?->nome,
                'foto_url' => $produto->foto_url,
            ])->values(),
            'proxima_pagina' => $pagina->hasMorePages() ? $pagina->currentPage() + 1 : null,
        ]);
    }

    public function produtosAutocomplete(Request $request): JsonResponse
    {
        return response()->json(
            $this->vendasService->produtosParaVenda((string) $request->query('q', ''))
                ->map(fn (Produto $produto): array => [
                    'id' => $produto->id,
                    'nome' => $produto->nome,
                    'codigo' => $produto->codigo,
                    'preco_venda' => number_format((float) $produto->preco_venda, 2, '.', ''),
                    'grupo' => $produto->grupo?->nome,
                    'foto_url' => $produto->foto_url,
                    'descricao' => $produto->descricao,
                    'favorito' => (bool) $produto->favorito,
                ])
                ->values()
        );
    }

    /**
     * @param  callable(): Venda  $salvar
     */
    private function salvar(callable $salvar): RedirectResponse
    {
        try {
            $venda = $salvar();

            $mensagem = $venda->status === Venda::STATUS_FECHADA
                ? "Venda #{$venda->id} fechada."
                : "Venda #{$venda->id} salva em aberto.";

            return redirect()->route('vendas')->with('success', $mensagem);
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (VendaInvalidaException $e) {
            return redirect()->back()->withErrors([$e->campo => $e->getMessage()]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao salvar venda: '.$e->getMessage());
        }
    }
}
