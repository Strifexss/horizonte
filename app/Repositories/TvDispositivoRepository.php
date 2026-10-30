<?php

namespace App\Repositories;

use App\Models\TvDispositivo;
use App\Repositories\Interfaces\TvDispositivoRepositoryInterface;
use Illuminate\Support\Collection;

class TvDispositivoRepository extends AbstractRepository implements TvDispositivoRepositoryInterface
{
    public function __construct(TvDispositivo $tvDispositivo)
    {
        parent::__construct($tvDispositivo);
    }

    public function findAtivoPorTokenHash(string $tokenHash): ?TvDispositivo
    {
        return $this->model->newQuery()
            ->where('token_hash', $tokenHash)
            ->whereNull('revogado_em')
            ->first();
    }

    public function ativosDaEmpresa(int $empresaId): Collection
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->whereNull('revogado_em')
            ->orderByDesc('id')
            ->get();
    }

    public function findAtivoDaEmpresa(int $id, int $empresaId): TvDispositivo
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->whereNull('revogado_em')
            ->findOrFail($id);
    }

    public function registrarAcesso(int $id): void
    {
        $this->model->newQuery()->whereKey($id)->update(['ultimo_acesso_em' => now()]);
    }

    public function revogar(int $id): void
    {
        $this->model->newQuery()->whereKey($id)->update(['revogado_em' => now()]);
    }
}
