<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

/**
 * Arquivo da pasta de imagens das novidades.
 *
 * @property array{arquivo: string, url: string, tamanho: int, modificado_em: Carbon, novidade_id: ?int, novidade_titulo: ?string} $resource
 */
class ImagemDiretorioResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'arquivo' => $this->resource['arquivo'],
            'url' => $this->resource['url'],
            'tamanho' => $this->resource['tamanho'],
            'modificado_em' => $this->resource['modificado_em']->toDateString(),
            'novidade' => $this->resource['novidade_id'] === null ? null : [
                'id' => $this->resource['novidade_id'],
                'titulo' => $this->resource['novidade_titulo'],
            ],
            'urls' => [
                'destroy' => route('admin.novidades.imagens.destroy', $this->resource['arquivo']),
            ],
        ];
    }
}
