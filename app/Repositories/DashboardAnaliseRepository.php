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

    public function ultimaDoPeriodo(int $empresaId, int $ano, int $mes): ?DashboardAnalise
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->where('ano', $ano)
            ->where('mes', $mes)
            ->with('acoes')
            ->latest('id')
            ->first();
    }

    public function findDaEmpresa(int $id, int $empresaId): DashboardAnalise
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);
    }

    public function contarGeradasDesde(int $empresaId, Carbon $desde): int
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->where('created_at', '>=', $desde)
            ->count();
    }
}
