<?php

namespace App\Services\Interfaces;

use App\DTO\FinanceiroDTO;

interface ExtratoServiceInterface extends AbstractServiceInterface
{
    public function index($data = null);
    public function show(int $id);
    public function storeParcelas(FinanceiroDTO $financeiroDto);
}

