<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Grupo extends Model
{
    protected $table = 'grupos';

    protected $fillable = [
        'nome',
        'usuario_id',
    ];

    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'nome' => 'string',
            'usuario_id' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function produtos(): HasMany
    {
        return $this->hasMany(Produto::class, 'grupo_id');
    }
}
