<?php

namespace App\Services;

use App\Repositories\Interfaces\GrupoRepositoryInterface;
use App\Services\Interfaces\GruposServiceInterface;

class GruposService extends ServiceAbstract implements GruposServiceInterface
{
    public function __construct(
        private GrupoRepositoryInterface $grupoRepository
    ) {
        parent::__construct($grupoRepository);
    }

    public function update($id, $data)
    {
        $this->grupoRepository->findForUsuario((int) $id);
        return parent::update($id, $data);
    }

    public function delete($id)
    {
        $grupo = $this->grupoRepository->findForUsuario((int) $id);
        $grupo->produtos()->update(['grupo_id' => null]);
        return parent::delete($id);
    }
}
