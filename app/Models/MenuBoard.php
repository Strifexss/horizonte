<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuBoard extends Model
{
    /**
     * Temas visuais aceitos para exibição na TV.
     *
     * @var list<string>
     */
    public const TEMAS = ['dark', 'clean', 'vibrante'];

    /**
     * @var string
     */
    protected $table = 'menu_board';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'usuario_id',
        'nome',
        'tema',
        'ativo',
    ];

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'ativo' => false,
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
            'tema' => 'string',
            'ativo' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function itens(): HasMany
    {
        return $this->hasMany(MenuBoardItem::class, 'menu_board_id')->orderBy('ordem');
    }
}
