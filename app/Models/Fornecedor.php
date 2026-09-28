<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fornecedor extends Model
{
    use HasFactory;

    protected $table = 'fornecedor';

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

    public function produtos(): HasMany
    {
        return $this->hasMany(Produto::class, 'fornecedor_id');
    }
}
