<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuBoardItem extends Model
{
    /**
     * @var string
     */
    protected $table = 'menu_board_item';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'menu_board_pagina_id',
        'produto_id',
        'destaque',
        'ordem',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'menu_board_pagina_id' => 'integer',
            'produto_id' => 'integer',
            'destaque' => 'boolean',
            'ordem' => 'integer',
        ];
    }

    public function pagina(): BelongsTo
    {
        return $this->belongsTo(MenuBoardPagina::class, 'menu_board_pagina_id');
    }

    public function produto(): BelongsTo
    {
        return $this->belongsTo(Produto::class, 'produto_id');
    }
}
