<?php

namespace App\Services;

use App\DTO\FinanceiroParcelaDTO;
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
     * @param  int  $id
     * @param  FinanceiroParcelaDTO  $dto
     */
    public function update($id, $dto)
    {
        $data = $dto->all();
        // all() remove nulls; FKs opcionais precisam poder ser limpas explicitamente.
        $data['produto_id'] = $dto->produto_id;
        $data['funcionario_id'] = $dto->funcionario_id;

        return $this->repository->update($id, $data);
    }
}
