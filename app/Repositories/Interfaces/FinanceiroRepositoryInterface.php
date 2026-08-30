<?php

namespace App\Repositories\Interfaces;

use App\DTO\FinanceiroParcelaDTO;

interface FinanceiroRepositoryInterface extends AbstractRepositoryInterface
{
    public function storeParcela(FinanceiroParcelaDTO $dto);
    public function indexParcelas($data = null);
}

