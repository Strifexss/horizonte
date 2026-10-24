<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormaPagamentoResource extends JsonResource
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
            'ativo' => (bool) $this->ativo,
            'baixa_automatica' => (bool) $this->baixa_automatica,
            'padrao' => $this->resource->ehPadrao(),
        ];
    }
}
