<?php

namespace App\Services;

use App\DTO\ContaDTO;
use App\Services\Interfaces\ContasServiceInterface;
use App\Repositories\Interfaces\ContaRepositoryInterface;

class ContasService extends ServiceAbstract implements ContasServiceInterface
{
    public function __construct(
        ContaRepositoryInterface $contaRepository
    )
    {
        parent::__construct($contaRepository);
    }

    /**
     * @param ContaDTO $data
     */
    public function store($data)
    {
        return parent::store($data);
    }

    public function index($data = null)
    {
        return parent::index($data);
    }
}
