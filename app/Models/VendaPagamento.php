<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendaPagamento extends Model
{
    /**
     * @var string
     */
    protected $table = 'venda_pagamento';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'venda_id',
        'forma_pagamento_id',
        'valor',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'venda_id' => 'integer',
            'forma_pagamento_id' => 'integer',
            'valor' => 'decimal:2',
        ];
    }

    public function venda(): BelongsTo
    {
        return $this->belongsTo(Venda::class, 'venda_id');
    }

    public function formaPagamento(): BelongsTo
    {
        return $this->belongsTo(FormaPagamento::class, 'forma_pagamento_id');
    }
}
