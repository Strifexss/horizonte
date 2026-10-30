<?php

namespace App\Services;

use App\Exceptions\PinPareamentoInvalidoException;
use App\Models\Empresa;
use App\Models\TvDispositivo;
use App\Models\TvPareamentoPin;
use App\Repositories\Interfaces\TvDispositivoRepositoryInterface;
use App\Repositories\Interfaces\TvPareamentoPinRepositoryInterface;
use App\Services\Interfaces\TvPareamentoServiceInterface;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class TvPareamentoService extends ServiceAbstract implements TvPareamentoServiceInterface
{
    public const VALIDADE_PIN_MINUTOS = 10;

    private const TENTATIVAS_GERAR_PIN = 50;

    public function __construct(
        private TvDispositivoRepositoryInterface $tvDispositivoRepository,
        private TvPareamentoPinRepositoryInterface $tvPareamentoPinRepository,
    ) {
        parent::__construct($tvDispositivoRepository);
    }

    public function gerarPin(int $usuarioId): TvPareamentoPin
    {
        return DB::transaction(function () use ($usuarioId) {
            $this->tvPareamentoPinRepository->liberarPinsVencidos();
            $this->tvPareamentoPinRepository->invalidarDaEmpresa((int) Empresa::idDoUsuario($usuarioId));

            return $this->gravarPinLivre($usuarioId);
        });
    }

    public function pinValidoDoUsuario(int $usuarioId): ?TvPareamentoPin
    {
        return $this->tvPareamentoPinRepository->findValidoDaEmpresa((int) Empresa::idDoUsuario($usuarioId));
    }

    public function parear(string $pin): string
    {
        return DB::transaction(function () use ($pin) {
            $pareamento = $this->tvPareamentoPinRepository->findValido($pin);

            if (! $pareamento || ! $this->tvPareamentoPinRepository->marcarUsado($pareamento->id)) {
                throw new PinPareamentoInvalidoException;
            }

            $token = Str::random(64);

            $this->tvDispositivoRepository->store([
                'empresa_id' => $pareamento->empresa_id,
                'usuario_id' => $pareamento->usuario_id,
                'token_hash' => $this->hashToken($token),
                'ultimo_acesso_em' => now(),
            ]);

            return $token;
        });
    }

    public function resolverDispositivo(?string $token): ?TvDispositivo
    {
        if ($token === null || $token === '') {
            return null;
        }

        $dispositivo = $this->tvDispositivoRepository->findAtivoPorTokenHash($this->hashToken($token));

        if ($dispositivo) {
            $this->tvDispositivoRepository->registrarAcesso($dispositivo->id);
        }

        return $dispositivo;
    }

    public function dispositivosDoUsuario(int $usuarioId): Collection
    {
        return $this->tvDispositivoRepository->ativosDaEmpresa((int) Empresa::idDoUsuario($usuarioId));
    }

    public function revogar(int $id, int $usuarioId): void
    {
        $dispositivo = $this->tvDispositivoRepository->findAtivoDaEmpresa($id, (int) Empresa::idDoUsuario($usuarioId));

        $this->tvDispositivoRepository->revogar($dispositivo->id);
    }

    /**
     * O índice único em `pin` decide a colisão; cada tentativa roda num savepoint para a transação seguir viva.
     */
    private function gravarPinLivre(int $usuarioId): TvPareamentoPin
    {
        for ($tentativa = 0; $tentativa < self::TENTATIVAS_GERAR_PIN; $tentativa++) {
            try {
                return DB::transaction(fn () => $this->tvPareamentoPinRepository->store([
                    'usuario_id' => $usuarioId,
                    'pin' => str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT),
                    'expira_em' => now()->addMinutes(self::VALIDADE_PIN_MINUTOS),
                ]));
            } catch (UniqueConstraintViolationException) {
                continue;
            }
        }

        throw new RuntimeException('Não foi possível gerar um PIN livre. Tente novamente.');
    }

    private function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }
}
