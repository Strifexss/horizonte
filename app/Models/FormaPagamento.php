<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormaPagamento extends Model
{
    public const NOME_ESPECIE = 'Espécie';

    /**
     * @var string
     */
    protected $table = 'forma_pagamento';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nome',
        'ativo',
        'baixa_automatica',
        'padrao',
        'usuario_id',
    ];

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'ativo' => true,
        'baixa_automatica' => true,
        'padrao' => 0,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'nome' => 'string',
            'ativo' => 'boolean',
            'baixa_automatica' => 'boolean',
            'padrao' => 'integer',
            'usuario_id' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function ehPadrao(): bool
    {
        return (int) $this->padrao === 1 || $this->usuario_id === null;
    }
}
