<?php

namespace App\Http\Resources;

use App\Models\Segmento;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Segmento
 */
class SegmentoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'chave' => $this->chave,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'modulos' => $this->modulos ?? [],
            'ativo' => $this->ativo,
            'empresas_count' => $this->whenCounted('empresas'),
            'urls' => $this->when($request->routeIs('admin.*'), fn () => [
                'update' => route('admin.segmentos.update', $this->id),
                'destroy' => route('admin.segmentos.destroy', $this->id),
            ]),
        ];
    }
}
