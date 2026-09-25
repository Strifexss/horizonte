<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinanceiroParcelaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'descricao' => $this->descricao,
            'data_vencimento' => $this->data_vencimento?->toDateString(),
            'data_competencia' => $this->data_competencia?->toDateString(),
            'valor' => $this->valor !== null ? number_format($this->valor, 2, '.', '') : null,
            'valor_pago' => $this->valor_pago !== null ? number_format($this->valor_pago, 2, '.', '') : null,
            'parcela' => $this->parcela,
            'categoria' => $this->categoria,
            'produto' => $this->produto,
            'produto_id' => $this->produto_id,
            'funcionario' => $this->funcionario,
            'funcionario_id' => $this->funcionario_id,
            'conta' => $this->conta,
            'financeiro' => $this->financeiro,
        ];
    }
}
