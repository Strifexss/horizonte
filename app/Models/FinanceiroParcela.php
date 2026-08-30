<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinanceiroParcela extends Model
{
    use HasFactory;

    /**
     * Tabela associada (nome no migration).
     *
     * @var string
     */
    protected $table = 'financeiro_parcela';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'descricao',
        'data_vencimento',
        'data_competencia',
        'valor',
        'valor_pago',
        'parcela',
        'financeiro_id',
        'usuario_id',
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
            'data_vencimento' => 'date',
            'data_competencia' => 'date',
            'valor' => 'decimal:2',
            'valor_pago' => 'decimal:2',
            'parcela' => 'integer',
            'financeiro_id' => 'integer',
            'usuario_id' => 'integer',
        ];
    }

    public function financeiro()
    {
        return $this->belongsTo(Financeiro::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class);
    }
}

