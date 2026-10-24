<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuBoardResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'tema' => $this->tema,
            'ativo' => (bool) $this->ativo,
            'itens_count' => $this->whenCounted('itens'),
            'destaques_count' => $this->when(isset($this->destaques_count), fn () => (int) $this->destaques_count),
            'atualizado_em' => $this->updated_at?->toDateString(),
            'itens' => $this->whenLoaded('itens', fn () => $this->itens
                ->map(fn ($item) => [
                    'produto_id' => $item->produto_id,
                    'destaque' => (bool) $item->destaque,
                ])
                ->values()),
        ];
    }
}
