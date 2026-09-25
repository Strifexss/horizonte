<?php

namespace App\Services;

use App\Repositories\Interfaces\FuncionarioRepositoryInterface;
use App\Services\Interfaces\FuncionariosServiceInterface;
use Illuminate\Support\Facades\DB;

class FuncionariosService extends ServiceAbstract implements FuncionariosServiceInterface
{
    public function __construct(
        private FuncionarioRepositoryInterface $funcionarioRepository
    ) {
        parent::__construct($funcionarioRepository);
    }

    public function update($id, $data)
    {
        $this->funcionarioRepository->findForUsuario((int) $id);

        return parent::update($id, $data);
    }

    public function delete($id)
    {
        $this->funcionarioRepository->findForUsuario((int) $id);

        return DB::transaction(function () use ($id) {
            $this->funcionarioRepository->nullifyFuncionarioIdOnParcelas((int) $id);

            return parent::delete($id);
        });
    }
}
