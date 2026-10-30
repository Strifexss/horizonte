<?php

namespace App\Repositories\Interfaces;

use App\Models\InsightAcao;
use Illuminate\Support\Collection;

interface InsightAcaoRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Grava (ou substitui) a ação do usuário sobre um insight da análise.
     *
     * @param  array{empresa_id: int, usuario_id: int, dashboard_analise_id: int, chave: string, tipo: string, titulo: string, acao: string, motivo: ?string, ano: int, mes: int}  $dados
     */
    public function registrar(array $dados): InsightAcao;

    public function remover(int $dashboardAnaliseId, string $chave): int;

    /**
     * Ações mais recentes do usuário, de qualquer período.
     *
     * @return Collection<int, InsightAcao>
     */
    public function historicoDaEmpresa(int $empresaId, int $limite = 30): Collection;
}
