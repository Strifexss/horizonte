<?php

namespace App\Repositories;

use App\Models\DashboardAnalise;
use App\Repositories\Interfaces\DashboardAnaliseRepositoryInterface;
use Illuminate\Support\Carbon;

class DashboardAnaliseRepository extends AbstractRepository implements DashboardAnaliseRepositoryInterface
{
    public function __construct(DashboardAnalise $dashboardAnalise)
    {
        parent::__construct($dashboardAnalise);
    }

    public function ultimaDoPeriodo(int $usuarioId, int $ano, int $mes): ?DashboardAnalise
    {
        return $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->where('ano', $ano)
            ->where('mes', $mes)
            ->with('acoes')
            ->latest('id')
            ->first();
    }

    public function findForUsuario(int $id, int $usuarioId): DashboardAnalise
    {
        return $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->findOrFail($id);
    }

    public function contarGeradasDesde(int $usuarioId, Carbon $desde): int
    {
        return $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->where('created_at', '>=', $desde)
            ->count();
    }
}
