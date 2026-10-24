<?php

namespace App\Repositories\Interfaces;

use App\DTO\VendaSearchDTO;
use App\Models\Venda;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface VendaRepositoryInterface extends AbstractRepositoryInterface
{
    public function indexFiltrado(VendaSearchDTO $filters): LengthAwarePaginator;

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
}
