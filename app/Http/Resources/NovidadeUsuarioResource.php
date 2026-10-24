<?php

namespace App\Http\Resources;

use App\Models\NovidadeImagem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NovidadeUsuarioResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'categoria' => $this->categoria,
            'imagens' => $this->imagens->map(fn (NovidadeImagem $imagem): array => ['id' => $imagem->id, 'url' => $imagem->url()])->all(),
            'cta_url' => $this->cta_url,
            'publicada_em' => $this->publicada_em?->toDateString(),
            'dispensada' => (bool) ($this->dispensada ?? false),
            'urls' => [
                'dispensar' => route('novidades.dispensar', $this->id),
            ],
        ];
    }
}
