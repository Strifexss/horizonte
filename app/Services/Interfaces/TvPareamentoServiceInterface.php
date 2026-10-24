<?php

namespace App\Services\Interfaces;

use App\Exceptions\PinPareamentoInvalidoException;
use App\Models\TvDispositivo;
use App\Models\TvPareamentoPin;
use Illuminate\Support\Collection;

interface TvPareamentoServiceInterface extends AbstractServiceInterface
{
    /**
     * Gera um novo PIN para o usuário e invalida os anteriores.
     */
    public function gerarPin(int $usuarioId): TvPareamentoPin;

    public function pinValidoDoUsuario(int $usuarioId): ?TvPareamentoPin;

    /**
     * Troca um PIN válido por um token de dispositivo. O token puro só existe neste retorno.
     *
     * @throws PinPareamentoInvalidoException
     */
    public function parear(string $pin): string;

    /**
     * Dispositivo ativo do token informado, registrando o acesso.
     */
    public function resolverDispositivo(?string $token): ?TvDispositivo;

    /**
     * @return Collection<int, TvDispositivo>
     */
    public function dispositivosDoUsuario(int $usuarioId): Collection;

    public function revogar(int $id, int $usuarioId): void;
}
