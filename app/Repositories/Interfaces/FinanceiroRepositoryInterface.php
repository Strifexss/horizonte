<?php

namespace App\Repositories\Interfaces;

use App\DTO\FinanceiroParcelaDTO;
use App\DTO\FinanceiroSearchDTO;

interface FinanceiroRepositoryInterface extends AbstractRepositoryInterface
{
    public function storeParcela(FinanceiroParcelaDTO $dto);

    public function indexParcelas(?FinanceiroSearchDTO $data = null);
}
