<?php

namespace App\Repositories\Interfaces;

use App\Models\TvDispositivo;
use Illuminate\Support\Collection;

interface TvDispositivoRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Dispositivo não revogado com o hash de token informado.
     */
    public function findAtivoPorTokenHash(string $tokenHash): ?TvDispositivo;

    /**
     * TVs conectadas do usuário, da mais recente para a mais antiga.
     *
     * @return Collection<int, TvDispositivo>
     */
    public function ativosDaEmpresa(int $empresaId): Collection;

    /**
     * Garante que o dispositivo ativo pertence ao usuário informado.
     */
    public function findAtivoDaEmpresa(int $id, int $empresaId): TvDispositivo;

    public function registrarAcesso(int $id): void;

    public function revogar(int $id): void;
}
