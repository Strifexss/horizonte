<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produto extends Model
{
    use HasFactory;

    /**
     * @var string
     */
    protected $table = 'produto';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nome',
        'preco_compra',
        'usuario_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'nome' => 'string',
            'preco_compra' => 'decimal:2',
            'usuario_id' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function parcelas(): HasMany
    {
        return $this->hasMany(FinanceiroParcela::class, 'produto_id');
    }
}
