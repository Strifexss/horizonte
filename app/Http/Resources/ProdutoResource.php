<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProdutoResource extends JsonResource
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
            'preco_compra' => $this->preco_compra !== null ? number_format((float) $this->preco_compra, 2, '.', '') : null,
            'preco_venda' => $this->preco_venda !== null ? number_format((float) $this->preco_venda, 2, '.', '') : '0.00',
            'ativo' => (bool) $this->ativo,
            'fornecedor_id' => $this->fornecedor_id,
            'grupo_id' => $this->grupo_id,
            'fornecedor' => $this->whenLoaded('fornecedor', fn () => $this->fornecedor
                ? ['id' => $this->fornecedor->id, 'nome' => $this->fornecedor->nome]
                : null),
            'grupo' => $this->whenLoaded('grupo', fn () => $this->grupo
                ? ['id' => $this->grupo->id, 'nome' => $this->grupo->nome]
                : null),
        ];
    }
}
