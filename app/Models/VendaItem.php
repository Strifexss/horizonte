<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendaItem extends Model
{
    /**
     * @var string
     */
    protected $table = 'venda_item';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'venda_id',
        'produto_id',
        'quantidade',
        'valor_unitario',
        'valor_total',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'venda_id' => 'integer',
            'produto_id' => 'integer',
            'quantidade' => 'decimal:3',
            'valor_unitario' => 'decimal:2',
            'valor_total' => 'decimal:2',
        ];
    }

    public function venda(): BelongsTo
    {
        return $this->belongsTo(Venda::class, 'venda_id');
    }

    public function produto(): BelongsTo
    {
        return $this->belongsTo(Produto::class, 'produto_id');
    }
}
