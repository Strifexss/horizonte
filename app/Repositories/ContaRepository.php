<?php

namespace App\Repositories;

use App\Models\Conta;
use App\Repositories\Interfaces\ContaRepositoryInterface;

class ContaRepository extends AbstractRepository implements ContaRepositoryInterface
{
    public function __construct(
        Conta $conta
    )
    {
        parent::__construct($conta);
    }
}