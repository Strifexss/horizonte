<?php

namespace App\Ai\Copiloto;

use App\Ai\Contracts\LimitadorIaInterface;
use App\Jobs\GerarAnaliseDashboard;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Usa a mesma chave de cache do middleware RateLimited(GerarAnaliseDashboard::LIMITADOR), que é
 * md5(nome do limitador + chave do Limit). Assim o Copiloto e os insights dividem o mesmo teto por minuto.
 */
class LimitadorIa implements LimitadorIaInterface
{
    public function reservar(): bool
    {
        $chave = md5(GerarAnaliseDashboard::LIMITADOR);
        $maximo = max(1, (int) config('insights.requisicoes_por_minuto'));

        if (RateLimiter::tooManyAttempts($chave, $maximo)) {
            return false;
        }

        RateLimiter::hit($chave, 60);

        return true;
    }
}
