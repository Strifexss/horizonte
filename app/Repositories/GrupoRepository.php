<?php

namespace App\Repositories;

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
            $query->where('usuario_id', Auth::id());
        }

        return $query->orderBy('nome')->get();
    }

    public function findForUsuario(int $id): Grupo
    {
        return $this->model->newQuery()
            ->where('usuario_id', Auth::id())
            ->findOrFail($id);
    }
}
