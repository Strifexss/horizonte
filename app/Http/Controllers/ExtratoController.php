<?php

namespace App\Http\Controllers;

use App\DTO\FinanceiroDTO;
use App\DTO\FinanceiroSearchDTO;
use App\Http\Requests\FinanceiroRequest;
use App\Http\Requests\FinanceiroSearchRequest;
use App\Http\Resources\FinanceiroParcelaResource;
use App\Services\Interfaces\CategoriaServiceInterface;
use App\Services\Interfaces\ContasServiceInterface;
use App\Services\Interfaces\ExtratoServiceInterface;
use App\Services\Interfaces\FornecedoresServiceInterface;
use App\Services\Interfaces\FuncionariosServiceInterface;
use App\Services\Interfaces\GruposServiceInterface;
use App\Services\Interfaces\ProdutosServiceInterface;
use Inertia\Inertia;

class ExtratoController extends FinanceiroAbstractController
{
    public function __construct(
        private ContasServiceInterface $contaService,
        private CategoriaServiceInterface $categoriaService,
        private ExtratoServiceInterface $extratoService,
        private ProdutosServiceInterface $produtosService,
        private FuncionariosServiceInterface $funcionariosService,
        private FornecedoresServiceInterface $fornecedoresService,
        private GruposServiceInterface $gruposService
    ) {}

    public function index(FinanceiroSearchRequest $request)
    {
        $filters = FinanceiroSearchDTO::fromArray($request->validated());

        return Inertia::render('extrato/index', [
            'filters' => $filters->all(),
            'categorias_padrao' => [
                'receita' => ($cat = $this->categoriaService->padraoPorTipo('receita')->first()) ? ['id' => $cat->id, 'nome' => $cat->nome, 'padrao' => $cat->padrao] : null,
                'despesa' => ($cat = $this->categoriaService->padraoPorTipo('despesa')->first()) ? ['id' => $cat->id, 'nome' => $cat->nome, 'padrao' => $cat->padrao] : null,
            ],
            'conta_padrao' => ($conta = $this->contaService->index()->sortByDesc('padrao')->first()) ? ['id' => $conta->id, 'nome' => $conta->nome, 'padrao' => $conta->padrao] : null,
            'categorias' => Inertia::lazy(fn () => $this->categoriaService->index()),
            'produtos' => Inertia::lazy(fn () => $this->produtosService->index()),
            'funcionarios' => Inertia::lazy(fn () => $this->funcionariosService->index()),
            'fornecedores' => Inertia::lazy(fn () => $this->fornecedoresService->index()),
            'grupos' => Inertia::lazy(fn () => $this->gruposService->index()),
            'resumo' => Inertia::defer(fn () => $this->extratoService->resumo($filters)),
            'parcelas' => Inertia::defer(fn () => FinanceiroParcelaResource::collection($this->extratoService->index($filters))),
        ]);
    }

    public function store(FinanceiroRequest $request)
    {
        try {
            $dto = FinanceiroDTO::fromArray($request->validated());
            $store = $this->extratoService->store($dto);

            return redirect()->route('extrato.index')->with('success', 'Lançamento criado.');
        } catch (\Exception $e) {
            return redirect()->route('extrato.index')->with('error', 'Erro ao criar lançamento: '.$e->getMessage());
        }

    }

    public function show(int $id)
    {
        return $this->extratoService->show($id);
    }

    public function update(FinanceiroRequest $request, int $id)
    {
        try {
            $dto = FinanceiroDTO::fromArray($request->validated());
            $this->extratoService->storeParcelas($dto);

            return redirect()->route('extrato.index')->with('success', 'Lançamento atualizado.');
        } catch (\Exception $e) {
            return redirect()->route('extrato.index')->with('error', 'Erro ao atualizar lançamento: '.$e->getMessage());
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->extratoService->delete($id);

            return redirect()->route('extrato.index')->with('success', 'Lançamento removido.');
        } catch (\Exception $e) {
            return redirect()->route('extrato.index')->with('error', 'Erro ao remover lançamento: '.$e->getMessage());
        }
    }
}
