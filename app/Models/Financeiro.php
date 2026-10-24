<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Financeiro extends Model
{
    use HasFactory;

    /**
     * Tabela associada (nome no migration).
     *
     * @var string
     */
    protected $table = 'financeiro';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'descricao',
        'valor',
        'tipo',
        'usuario_id',
        'forma_pagamento_id',
        'venda_id',
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
            'descricao' => 'string',
            'valor' => 'decimal:2',
            'tipo' => 'string',
            'categoria_id' => 'integer',
            'conta_id' => 'integer',
            'forma_pagamento_id' => 'integer',
            'venda_id' => 'integer',
        ];
    }

    public function formaPagamento()
    {
        return $this->belongsTo(FormaPagamento::class, 'forma_pagamento_id');
    }

    public function venda()
    {
        return $this->belongsTo(Venda::class, 'venda_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class);
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function conta()
    {
        return $this->belongsTo(Conta::class);
    }

    public function parcelas()
    {
        return $this->hasMany(FinanceiroParcela::class);
    }
}
