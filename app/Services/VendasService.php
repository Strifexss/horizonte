<?php

namespace App\Services;

use App\DTO\FinanceiroDTO;
use App\DTO\VendaDTO;
use App\DTO\VendaSearchDTO;
use App\Exceptions\VendaInvalidaException;
use App\Models\Categoria;
use App\Models\Conta;
use App\Models\FormaPagamento;
use App\Models\Venda;
use App\Repositories\Interfaces\CategoriaRepositoryInterface;
use App\Repositories\Interfaces\ContaRepositoryInterface;
use App\Repositories\Interfaces\FormaPagamentoRepositoryInterface;
use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use App\Repositories\Interfaces\VendaRepositoryInterface;
use App\Services\Interfaces\ExtratoServiceInterface;
use App\Services\Interfaces\VendasServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class VendasService extends ServiceAbstract implements VendasServiceInterface
{
    public function __construct(
        private VendaRepositoryInterface $vendaRepository,
        private ProdutoRepositoryInterface $produtoRepository,
        private FormaPagamentoRepositoryInterface $formaPagamentoRepository,
        private ContaRepositoryInterface $contaRepository,
        private CategoriaRepositoryInterface $categoriaRepository,
        private ExtratoServiceInterface $extratoService,
    ) {
        parent::__construct($vendaRepository);
    }

    public function indexFiltrado(VendaSearchDTO $filters): LengthAwarePaginator
    {
        return $this->vendaRepository->indexFiltrado($filters);
    }

    public function produtosParaVenda(?string $q = null): Collection
    {
        return $this->produtoRepository->autocompleteParaVenda($q);
    }

    /**
     * @param  VendaDTO  $data
     */
    public function store($data): Venda
    {
        return $this->salvar(null, $data);
    }

    /**
     * @param  VendaDTO  $data
     */
    public function update($id, $data): Venda
    {
        $venda = $this->vendaRepository->findDoUsuario((int) $id);

        if (! $venda->estaAberta()) {
            throw new VendaInvalidaException('venda', 'Só é possível alterar uma venda aberta.');
        }

        return $this->salvar($venda, $data);
    }

    public function cancelar(int $id): Venda
    {
        $venda = $this->vendaRepository->findDoUsuario($id);

        if ($venda->status === Venda::STATUS_CANCELADA) {
            throw new VendaInvalidaException('venda', 'Esta venda já está cancelada.');
        }

        return DB::transaction(function () use ($venda): Venda {
            $this->vendaRepository->excluirFinanceirosDaVenda($venda->id);
            $this->vendaRepository->update($venda->id, ['status' => Venda::STATUS_CANCELADA]);

            return $this->vendaRepository->findDoUsuario($venda->id);
        });
    }

    private function salvar(?Venda $venda, VendaDTO $dto): Venda
    {
        $itens = $this->montarItens($venda, $dto->itens);
        $totalCentavos = array_sum(array_map(fn (array $item): int => $this->centavos($item['valor_total']), $itens));

        $pagamentos = $this->montarPagamentos($dto->pagamentos);
        $pagoCentavos = array_sum(array_map(fn (array $pagamento): int => $this->centavos($pagamento['valor']), $pagamentos));

        if ($pagoCentavos > $totalCentavos) {
            throw new VendaInvalidaException('pagamentos', 'A soma dos pagamentos não pode ser maior que o total da venda.');
        }

        $fecha = $pagoCentavos === $totalCentavos;
        $conta = $fecha ? $this->contaRepository->padraoDoUsuario($dto->usuario_id) : null;

        if ($fecha && $conta === null) {
            throw new VendaInvalidaException(VendaInvalidaException::CAMPO_CONTA, 'Cadastre uma conta para fechar a venda.');
        }

        return DB::transaction(function () use ($venda, $dto, $itens, $pagamentos, $totalCentavos, $fecha, $conta): Venda {
            $dados = [
                'status' => $fecha ? Venda::STATUS_FECHADA : Venda::STATUS_ABERTA,
                'total' => $totalCentavos / 100,
                'observacao' => $dto->observacao,
            ];

            if ($venda === null || $fecha) {
                $dados['data_venda'] = now();
            }

            $venda = $venda === null
                ? $this->vendaRepository->store([...$dados, 'usuario_id' => $dto->usuario_id])
                : $this->vendaRepository->update($venda->id, $dados);

            $this->vendaRepository->substituirItens($venda, $itens);
            $this->vendaRepository->substituirPagamentos($venda, array_map(fn (array $pagamento): array => [
                'forma_pagamento_id' => $pagamento['forma']->id,
                'valor' => $pagamento['valor'],
            ], $pagamentos));

            if ($fecha) {
                $this->gerarReceitas($venda, $pagamentos, $conta);
            }

            return $this->vendaRepository->findDoUsuario($venda->id);
        });
    }

    /**
     * Junta produtos repetidos numa linha só e grava o valor do item no momento da venda.
     *
     * @param  list<array{produto_id: int, quantidade: float, valor_unitario: float}>  $itensRecebidos
     * @return list<array{produto_id: int, quantidade: float, valor_unitario: float, valor_total: float}>
     */
    private function montarItens(?Venda $venda, array $itensRecebidos): array
    {
        if ($itensRecebidos === []) {
            throw new VendaInvalidaException('itens', 'Adicione ao menos um produto.');
        }

        $porProduto = [];
        foreach ($itensRecebidos as $item) {
            $produtoId = $item['produto_id'];

            if (isset($porProduto[$produtoId])) {
                $porProduto[$produtoId]['quantidade'] += $item['quantidade'];

                continue;
            }

            $porProduto[$produtoId] = $item;
        }

        $produtos = $this->produtoRepository->findManyDoUsuario(array_keys($porProduto));
        $produtosJaNaVenda = $venda?->itens->pluck('produto_id')->all() ?? [];

        $itens = [];
        foreach ($porProduto as $produtoId => $item) {
            $produto = $produtos->get($produtoId);

            if ($produto === null) {
                throw new VendaInvalidaException('itens', 'Produto não encontrado.');
            }

            if (! $produto->ativo && ! in_array($produtoId, $produtosJaNaVenda, true)) {
                throw new VendaInvalidaException('itens', "O produto {$produto->nome} está inativo.");
            }

            $quantidade = round($item['quantidade'], 3);
            $valorUnitario = round($item['valor_unitario'], 2);
            $valorTotal = round($quantidade * $valorUnitario, 2);

            if ($this->centavos($valorTotal) <= 0) {
                throw new VendaInvalidaException('itens', "O total do item {$produto->nome} precisa ser maior que zero.");
            }

            $itens[] = [
                'produto_id' => $produtoId,
                'quantidade' => $quantidade,
                'valor_unitario' => $valorUnitario,
                'valor_total' => $valorTotal,
            ];
        }

        return $itens;
    }

    /**
     * @param  list<array{forma_pagamento_id: int, valor: float}>  $pagamentosRecebidos
     * @return list<array{forma: FormaPagamento, valor: float}>
     */
    private function montarPagamentos(array $pagamentosRecebidos): array
    {
        return array_map(fn (array $pagamento): array => [
            'forma' => $this->formaPagamentoRepository->findVisivel($pagamento['forma_pagamento_id']),
            'valor' => round($pagamento['valor'], 2),
        ], $pagamentosRecebidos);
    }

    /**
     * Uma receita por pagamento; formas com baixa automática já nascem pagas.
     *
     * @param  list<array{forma: FormaPagamento, valor: float}>  $pagamentos
     */
    private function gerarReceitas(Venda $venda, array $pagamentos, Conta $conta): void
    {
        $categoria = $this->categoriaRepository->findDoSistemaPorNome(Categoria::NOME_VENDA);
        $data = $venda->data_venda->toDateString();

        foreach ($pagamentos as $pagamento) {
            $this->extratoService->store(FinanceiroDTO::fromArray([
                'descricao' => "Venda #{$venda->id} - {$pagamento['forma']->nome}",
                'valor' => $pagamento['valor'],
                'tipo' => 'RECEITA',
                'categoria_id' => $categoria->id,
                'conta_id' => $conta->id,
                'usuario_id' => $venda->usuario_id,
                'data_vencimento' => $data,
                'data_competencia' => $data,
                'valor_pago' => $pagamento['forma']->baixa_automatica ? $pagamento['valor'] : 0.0,
                'qtd_parcelas' => 1,
                'forma_pagamento_id' => $pagamento['forma']->id,
                'venda_id' => $venda->id,
            ]));
        }
    }

    private function centavos(float $valor): int
    {
        return (int) round($valor * 100);
    }
}
