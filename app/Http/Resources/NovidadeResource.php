<?php

namespace App\Http\Resources;

use App\Models\NovidadeImagem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NovidadeResource extends JsonResource
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
            'status' => $this->status,
            'popup_automatico' => (bool) $this->popup_automatico,
            'imagens' => $this->imagens->map(fn (NovidadeImagem $imagem): array => ['id' => $imagem->id, 'url' => $imagem->url()])->all(),
            'cta_url' => $this->cta_url,
            'publicada_em' => $this->publicada_em?->toDateString(),
            'urls' => [
                'update' => route('admin.novidades.update', $this->id),
                'destroy' => route('admin.novidades.destroy', $this->id),
                'status' => route('admin.novidades.status', $this->id),
            ],
        ];
    }
}
