<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TvDispositivo extends Model
{
    /**
     * @var string
     */
    protected $table = 'tv_dispositivo';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'usuario_id',
        'nome',
        'token_hash',
        'ultimo_acesso_em',
        'revogado_em',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'token_hash',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'usuario_id' => 'integer',
            'nome' => 'string',
            'ultimo_acesso_em' => 'datetime',
            'revogado_em' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
