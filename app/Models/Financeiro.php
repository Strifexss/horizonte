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
        'valor_total',
        'tipo',
        'categoria_id',
        'conta_id',
        'qtd_parcelas',
        'data_criacao',
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
            'valor_total' => 'decimal:2',
            'tipo' => 'string',
            'categoria_id' => 'integer',
            'conta_id' => 'integer',
            'qtd_parcelas' => 'integer',
            'data_criacao' => 'datetime',
        ];
    }
}

