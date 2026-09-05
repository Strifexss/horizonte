<?php

namespace App\Services;

use App\Repositories\Interfaces\FinanceiroParcelaRepositoryInterface;
use App\Services\Interfaces\FinanceiroParcelaServiceInterface;

class FinanceiroParcelaService extends ServiceAbstract implements FinanceiroParcelaServiceInterface
{
    public function __construct(
        FinanceiroParcelaRepositoryInterface $repository
    ) {
        parent::__construct($repository);
    }

    /**
     * @param int $id
     * @param FinanceiroParcelaDTO $dto
     */
    public function update($id, $dto)
    {
        return $this->repository->update($id, $dto);
    }
}