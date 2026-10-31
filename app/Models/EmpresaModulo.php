<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Ajuste do Administrador: liga ou desliga um módulo opcional numa Empresa, valendo por cima do Segmento.
 */
class EmpresaModulo extends Model
{
    protected $table = 'empresa_modulo';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'empresa_id',
        'modulo',
        'ligado',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'empresa_id' => 'integer',
            'ligado' => 'boolean',
        ];
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }
}
