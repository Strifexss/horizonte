<?php

namespace App\Repositories;

use App\Models\FinanceiroParcela;
use App\Repositories\Interfaces\FinanceiroParcelaRepositoryInterface;

class FinanceiroParcelaRepository extends AbstractRepository implements FinanceiroParcelaRepositoryInterface
{
    public function __construct(FinanceiroParcela $financeiroParcela)
    {
        parent::__construct($financeiroParcela);
    }
}
