<?php

namespace App\Http\Resources;

use App\Models\Empresa;
use App\Modulos;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Empresa
 */
class EmpresaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $adminMaster = $this->usuarios->firstWhere('pivot.cargo', Empresa::CARGO_ADMIN_MASTER) ?? $this->usuarios->first();

        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'segmento_id' => $this->segmento_id,
            'segmento' => $this->segmento?->nome,
            'modulos' => $this->modulosDisponiveis(),
            'ajustes' => collect(array_keys(Modulos::OPCIONAIS))
                ->mapWithKeys(function (string $modulo) {
                    $ajuste = $this->ajustesDeModulo->firstWhere('modulo', $modulo);

                    return [$modulo => $ajuste === null ? 'herdar' : ($ajuste->ligado ? 'ligar' : 'desligar')];
                })
                ->all(),
            'admin_master' => $adminMaster ? [
                'name' => $adminMaster->name,
                'email' => $adminMaster->email,
                'conta_google' => $adminMaster->ehContaGoogle(),
            ] : null,
            'urls' => [
                'update' => route('admin.empresas.update', $this->id),
                'entrar_como' => $adminMaster ? route('admin.usuarios.entrar-como', $adminMaster->id) : null,
            ],
        ];
    }
}
