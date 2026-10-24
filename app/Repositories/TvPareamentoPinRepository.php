<?php

namespace App\Repositories;

use App\Models\TvPareamentoPin;
use App\Repositories\Interfaces\TvPareamentoPinRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;

class TvPareamentoPinRepository extends AbstractRepository implements TvPareamentoPinRepositoryInterface
{
    public function __construct(TvPareamentoPin $tvPareamentoPin)
    {
        parent::__construct($tvPareamentoPin);
    }

    public function existeValido(string $pin): bool
    {
        return $this->validos()->where('pin', $pin)->exists();
    }

    public function findValido(string $pin): ?TvPareamentoPin
    {
        return $this->validos()->where('pin', $pin)->first();
    }

    public function findValidoDoUsuario(int $usuarioId): ?TvPareamentoPin
    {
        return $this->validos()
            ->where('usuario_id', $usuarioId)
            ->latest('id')
            ->first();
    }

    public function invalidarDoUsuario(int $usuarioId): int
    {
        return $this->validos()
            ->where('usuario_id', $usuarioId)
            ->update(['expira_em' => now()]);
    }

    public function marcarUsado(int $id): void
    {
        $this->model->newQuery()->whereKey($id)->update(['usado_em' => now()]);
    }

    /**
     * @return Builder<TvPareamentoPin>
     */
    private function validos(): Builder
    {
        return $this->model->newQuery()
            ->whereNull('usado_em')
            ->where('expira_em', '>', now());
    }
}
