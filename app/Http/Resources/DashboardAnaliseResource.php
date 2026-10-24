<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardAnaliseResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $acoes = $this->acoes->keyBy('chave');

        return [
            'id' => $this->id,
            'ano' => $this->ano,
            'mes' => $this->mes,
            'status' => $this->status,
            'erro' => $this->erro,
            'gerada_em' => $this->created_at?->toIso8601String(),
            'resumo' => (string) $this->resumo,
            'resultados_acoes' => $this->resultados_acoes ?? [],
            'insights' => collect($this->insights ?? [])
                ->map(fn (array $insight): array => [
                    ...$insight,
                    'acao_usuario' => $acoes->get($insight['chave'])?->acao,
                    'motivo_usuario' => $acoes->get($insight['chave'])?->motivo,
                ])
                ->values()
                ->all(),
        ];
    }
}
