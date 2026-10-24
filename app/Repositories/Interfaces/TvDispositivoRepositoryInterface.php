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
    public function ativosDoUsuario(int $usuarioId): Collection;

    /**
     * Garante que o dispositivo ativo pertence ao usuário informado.
     */
    public function findAtivoForUsuario(int $id, int $usuarioId): TvDispositivo;

    public function registrarAcesso(int $id): void;

    public function revogar(int $id): void;
}
