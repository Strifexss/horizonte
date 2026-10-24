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

    public function liberarPinsVencidos(): int
    {
        return $this->model->newQuery()
            ->where(fn (Builder $query) => $query
                ->whereNotNull('usado_em')
                ->orWhere('expira_em', '<=', now()))
            ->delete();
    }

    public function marcarUsado(int $id): bool
    {
        return $this->validos()->whereKey($id)->update(['usado_em' => now()]) === 1;
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
