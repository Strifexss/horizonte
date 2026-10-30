<?php

namespace App\Models\Concerns;

use App\Models\Empresa;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Registro cujo dono é uma Empresa. Ao criar sem `empresa_id`, usa a Empresa do autor
 * (`usuario_id`) ou, sem autor, a Empresa ativa do usuário logado.
 */
trait PertenceAEmpresa
{
    public static function bootPertenceAEmpresa(): void
    {
        static::creating(function ($model): void {
            if ($model->empresa_id !== null) {
                return;
            }

            if ($model->usuario_id !== null) {
                $model->empresa_id = Empresa::idDoUsuario((int) $model->usuario_id);

                return;
            }

            if (! $model->ehRegistroDoSistema()) {
                $model->empresa_id = Empresa::atualId();
            }
        });
    }

    public function initializePertenceAEmpresa(): void
    {
        $this->mergeFillable(['empresa_id']);
        $this->mergeCasts(['empresa_id' => 'integer']);
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    /**
     * Padrões do sistema nascem sem autor e sem Empresa.
     */
    protected function ehRegistroDoSistema(): bool
    {
        return false;
    }
}
