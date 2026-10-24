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
        'menu_board_id',
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
            'menu_board_id' => 'integer',
            'produto_id' => 'integer',
            'destaque' => 'boolean',
            'ordem' => 'integer',
        ];
    }

    public function menuBoard(): BelongsTo
    {
        return $this->belongsTo(MenuBoard::class, 'menu_board_id');
    }

    public function produto(): BelongsTo
    {
        return $this->belongsTo(Produto::class, 'produto_id');
    }
}
