<?php

namespace App\Models;

use App\Models\Concerns\PertenceAEmpresa;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TvPareamentoPin extends Model
{
    use PertenceAEmpresa;

    /**
     * @var string
     */
    protected $table = 'tv_pareamento_pin';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'usuario_id',
        'pin',
        'expira_em',
        'usado_em',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'usuario_id' => 'integer',
            'pin' => 'string',
            'expira_em' => 'datetime',
            'usado_em' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
