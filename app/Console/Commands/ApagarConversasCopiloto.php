<?php

namespace App\Console\Commands;

use App\Services\Interfaces\CopilotoServiceInterface;
use Illuminate\Console\Command;

class ApagarConversasCopiloto extends Command
{
    /**
     * @var string
     */
    protected $signature = 'copiloto:apagar-conversas';

    /**
     * @var string
     */
    protected $description = 'Apaga as conversas do Copiloto sem atividade há mais de copiloto.dias_para_apagar_conversa dias';

    public function handle(CopilotoServiceInterface $copilotoService): int
    {
        $this->info($copilotoService->apagarConversasSemAtividade().' conversa(s) apagada(s).');

        return self::SUCCESS;
    }
}
