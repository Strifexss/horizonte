<?php

namespace App\Services\Interfaces;

use App\Models\FinanceiroParcela;
use Illuminate\Support\Collection;

interface InicioServiceInterface extends AbstractServiceInterface
{
    /**
     * Primeiros passos da Empresa da sessão, feitos ou não pelos dados que ela já tem.
     * O passo da TV só entra quando a Empresa pode usar o Menu Board.
     *
     * @return list<array{chave: string, feito: bool}>
     */
    public function primeirosPassos(): array;

    /**
     * Receitas, despesas e saldo de hoje e do mês atual, pela competência.
     *
     * @return array{
     *     hoje: array{receitas: float, despesas: float, saldo: float},
     *     mes: array{receitas: float, despesas: float, saldo: float}
     * }
     */
    public function resumo(): array;

    /**
     * Parcelas lançadas mais recentemente na Empresa da sessão.
     *
     * @return Collection<int, FinanceiroParcela>
     */
    public function ultimosLancamentos(): Collection;
}
