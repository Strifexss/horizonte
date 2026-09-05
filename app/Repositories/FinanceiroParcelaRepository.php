<?php

namespace App\Repositories;

use App\DTO\FinanceiroParcelaDTO;
use App\Models\FinanceiroParcela;
use App\Repositories\Interfaces\FinanceiroParcelaRepositoryInterface;

class FinanceiroParcelaRepository extends AbstractRepository implements FinanceiroParcelaRepositoryInterface
{
    public function __construct(FinanceiroParcela $financeiroParcela)
    {
        parent::__construct($financeiroParcela);
    }

    /**
     * @param FinanceiroParcelaDTO $dto
     */
    public function update($id, $dto)
    {
        return $this->model->findOrFail($id)->update($dto->all());
    }
}