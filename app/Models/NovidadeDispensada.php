<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NovidadeDispensada extends Model
{
    /**
     * @var string
     */
    protected $table = 'novidade_dispensada';

    /**
     * @var bool
     */
    public $timestamps = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'usuario_id',
        'novidade_id',
        'dispensada_em',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'usuario_id' => 'integer',
            'novidade_id' => 'integer',
            'dispensada_em' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function novidade(): BelongsTo
    {
        return $this->belongsTo(Novidade::class, 'novidade_id');
    }
}
