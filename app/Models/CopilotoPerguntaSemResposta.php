<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pergunta que o Copiloto não soube responder. Não guarda o usuário.
 */
class CopilotoPerguntaSemResposta extends Model
{
    /**
     * @var string
     */
    protected $table = 'copiloto_pergunta_sem_resposta';

    /**
     * @var list<string>
     */
    protected $fillable = ['empresa_id', 'pergunta', 'tela'];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }
}
