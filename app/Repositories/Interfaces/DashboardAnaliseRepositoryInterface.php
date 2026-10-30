<?php

namespace App\Repositories\Interfaces;

use App\Models\DashboardAnalise;
use Illuminate\Support\Carbon;

interface DashboardAnaliseRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Análise mais recente do usuário no período, com as ações registradas.
     */
    public function ultimaDoPeriodo(int $empresaId, int $ano, int $mes): ?DashboardAnalise;

    /**
     * Garante que a análise pertence ao usuário informado.
     */
    public function findDaEmpresa(int $id, int $empresaId): DashboardAnalise;

    /**
     * Quantidade de análises geradas pelo usuário a partir do instante informado.
     */
    public function contarGeradasDesde(int $empresaId, Carbon $desde): int;
}
