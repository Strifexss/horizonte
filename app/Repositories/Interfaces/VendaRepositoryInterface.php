<?php

namespace App\Repositories\Interfaces;

use App\DTO\VendaSearchDTO;
use App\Models\Venda;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface VendaRepositoryInterface extends AbstractRepositoryInterface
{
    public function indexFiltrado(VendaSearchDTO $filters): LengthAwarePaginator;

    /**
     * Quantidade de vendas por status no período filtrado (ignora o status), para os chips.
     *
     * @return array{todos: int, aberta: int, fechada: int, cancelada: int}
     */
    public function contagemPorStatus(VendaSearchDTO $filters): array;

    /**
     * Venda do usuário autenticado com itens e pagamentos.
     */
    public function findDoUsuario(int $id): Venda;

    /**
     * @param  list<array{produto_id: int, quantidade: float, valor_unitario: float, valor_total: float}>  $itens
     */
    public function substituirItens(Venda $venda, array $itens): void;

    /**
     * @param  list<array{forma_pagamento_id: int, valor: float}>  $pagamentos
     */
    public function substituirPagamentos(Venda $venda, array $pagamentos): void;

    /**
     * Exclui as receitas (financeiro e parcelas) geradas pela venda.
     */
    public function excluirFinanceirosDaVenda(int $vendaId): int;

    /**
     * Itens de vendas fechadas no período: quantidade vendida e receita por produto.
     *
     * @return Collection<int, object{produto_id: int, produto: string, quantidade: float|string, receita: float|string}>
     */
    public function vendasPorProdutoNoPeriodo(int $usuarioId, string $dataInicio, string $dataFim): Collection;

    /**
     * Quantidade de vendas fechadas, total vendido e quantidade de itens no período.
     *
     * @return array{vendas: int, total: float, itens: int}
     */
    public function resumoNoPeriodo(int $usuarioId, string $dataInicio, string $dataFim): array;
}
