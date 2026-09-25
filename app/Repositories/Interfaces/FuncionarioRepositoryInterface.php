<?php

namespace App\Repositories\Interfaces;

interface FuncionarioRepositoryInterface extends AbstractRepositoryInterface
{
    public function nullifyFuncionarioIdOnParcelas(int $funcionarioId): int;
}
