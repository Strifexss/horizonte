<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Categoria extends Model
{
    use HasFactory;

    /**
     * Tabela associada (nome no migration).
     *
     * @var string
     */
    protected $table = 'categoria';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nome',
        'padrao',
        'usuario_id',
        'tipo',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'nome' => 'string',
            'padrao' => 'integer',
            'usuario_id' => 'integer',
            'tipo' => 'string',
        ];
    }

    /**
     * Relação com o usuário dono da categoria.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}