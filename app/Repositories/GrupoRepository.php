<?php

namespace App\Repositories;

use App\Models\Empresa;
use App\Models\Grupo;
use App\Repositories\Interfaces\GrupoRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class GrupoRepository extends AbstractRepository implements GrupoRepositoryInterface
{
    public function __construct(Grupo $grupo)
    {
        parent::__construct($grupo);
    }

    public function index($data = null)
    {
        $query = $this->model->newQuery();
        if (Auth::check()) {
            $query->where('empresa_id', Empresa::atualId());
        }

        return $query->orderBy('nome')->get();
    }

    public function findDaEmpresa(int $id): Grupo
    {
        return $this->model->newQuery()
            ->where('empresa_id', Empresa::atualId())
            ->findOrFail($id);
    }
}
