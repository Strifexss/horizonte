<?php

namespace App\Models;

use App\Models\Concerns\PertenceAEmpresa;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venda extends Model
{
    use PertenceAEmpresa;

    public const STATUS_ABERTA = 'aberta';

    public const STATUS_FECHADA = 'fechada';

    public const STATUS_CANCELADA = 'cancelada';

    /**
     * @var string
     */
    protected $table = 'venda';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'status',
        'total',
        'data_venda',
        'observacao',
        'usuario_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'status' => 'string',
            'total' => 'decimal:2',
            'data_venda' => 'datetime',
            'usuario_id' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function itens(): HasMany
    {
        return $this->hasMany(VendaItem::class, 'venda_id');
    }

    public function pagamentos(): HasMany
    {
        return $this->hasMany(VendaPagamento::class, 'venda_id');
    }

    public function financeiros(): HasMany
    {
        return $this->hasMany(Financeiro::class, 'venda_id');
    }

    public function estaAberta(): bool
    {
        return $this->status === self::STATUS_ABERTA;
    }
}
