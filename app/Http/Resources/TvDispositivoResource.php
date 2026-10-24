<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TvDispositivoResource extends JsonResource
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
            'conectada_em' => $this->created_at?->toIso8601String(),
            'ultimo_acesso_em' => $this->ultimo_acesso_em?->toIso8601String(),
        ];
    }
}
