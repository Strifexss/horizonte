<?php

namespace App\Services;

use App\Repositories\Interfaces\FornecedorRepositoryInterface;
use App\Services\Interfaces\FornecedoresServiceInterface;
use Illuminate\Support\Facades\DB;

class FornecedoresService extends ServiceAbstract implements FornecedoresServiceInterface
{
    public function __construct(
        private FornecedorRepositoryInterface $fornecedorRepository
    ) {
        parent::__construct($fornecedorRepository);
    }

    public function update($id, $data)
    {
        $this->fornecedorRepository->findDaEmpresa((int) $id);

        return parent::update($id, $data);
    }

    public function delete($id)
    {
        $this->fornecedorRepository->findDaEmpresa((int) $id);

        return DB::transaction(function () use ($id) {
            $this->fornecedorRepository->nullifyFornecedorIdOnProdutos((int) $id);

            return parent::delete($id);
        });
    }

    public function deleteByEmpresa(int $empresaId): int
    {
        return $this->fornecedorRepository->deleteByEmpresa($empresaId);
    }
}
