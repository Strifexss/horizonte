<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Interesse registrado ao tocar em "Quero o <módulo>" no Copiloto.
 */
class CopilotoInteresse extends Model
{
    /**
     * @var string
     */
    protected $table = 'copiloto_interesse';

    /**
     * @var list<string>
     */
    protected $fillable = ['empresa_id', 'user_id', 'modulo'];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
