<?php

namespace App\Repositories\Interfaces;

use App\Models\DashboardAnalise;
use Illuminate\Support\Carbon;

interface DashboardAnaliseRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Análise mais recente do usuário no período, com as ações registradas.
     */
    public function ultimaDoPeriodo(int $usuarioId, int $ano, int $mes): ?DashboardAnalise;

    /**
     * Garante que a análise pertence ao usuário informado.
     */
    public function findForUsuario(int $id, int $usuarioId): DashboardAnalise;

    /**
     * Quantidade de análises geradas pelo usuário a partir do instante informado.
     */
    public function contarGeradasDesde(int $usuarioId, Carbon $desde): int;
}
