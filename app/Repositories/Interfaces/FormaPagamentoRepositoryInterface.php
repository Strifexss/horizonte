<?php

namespace App\Repositories\Interfaces;

use App\Models\FormaPagamento;
use Illuminate\Support\Collection;

interface FormaPagamentoRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Formas padrão e próprias do usuário autenticado que estão ativas.
     *
     * @return Collection<int, FormaPagamento>
     */
    public function ativas(): Collection;

    /**
     * Forma padrão ou própria do usuário autenticado; 404 para formas de outro usuário.
     */
    public function findVisivel(int $id): FormaPagamento;

    /**
     * Quantos lançamentos e pagamentos de venda usam a forma.
     */
    public function countUsos(int $id): int;
}
