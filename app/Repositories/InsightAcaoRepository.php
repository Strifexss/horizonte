<?php

namespace App\Repositories;

use App\Models\InsightAcao;
use App\Repositories\Interfaces\InsightAcaoRepositoryInterface;
use Illuminate\Support\Collection;

class InsightAcaoRepository extends AbstractRepository implements InsightAcaoRepositoryInterface
{
    public function __construct(InsightAcao $insightAcao)
    {
        parent::__construct($insightAcao);
    }

    public function registrar(array $dados): InsightAcao
    {
        return $this->model->newQuery()->updateOrCreate(
            ['dashboard_analise_id' => $dados['dashboard_analise_id'], 'chave' => $dados['chave']],
            $dados,
        );
    }

    public function remover(int $dashboardAnaliseId, string $chave): int
    {
        return $this->model->newQuery()
            ->where('dashboard_analise_id', $dashboardAnaliseId)
            ->where('chave', $chave)
            ->delete();
    }

    public function historicoDaEmpresa(int $empresaId, int $limite = 30): Collection
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->latest('id')
            ->limit($limite)
            ->get();
    }
}
