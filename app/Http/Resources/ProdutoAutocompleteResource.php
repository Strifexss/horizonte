<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProdutoAutocompleteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $fornecedor = null;
        if ($this->relationLoaded('fornecedor') && $this->fornecedor) {
            $fornecedor = [
                'id' => $this->fornecedor->id,
                'nome' => $this->fornecedor->nome,
            ];
        } elseif (isset($this->fornecedor_id) && $this->fornecedor_id) {
            $fornecedor = [
                'id' => $this->fornecedor_id,
                'nome' => null,
            ];
        }

        $grupo = null;
        if ($this->relationLoaded('grupo') && $this->grupo) {
            $grupo = [
                'id' => $this->grupo->id,
                'nome' => $this->grupo->nome,
            ];
        } elseif (isset($this->grupo_id) && $this->grupo_id) {
            $grupo = [
                'id' => $this->grupo_id,
                'nome' => null,
            ];
        }

        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'preco_compra' => $this->preco_compra ?? null,
            'fornecedor' => $fornecedor,
            'fornecedor_id' => $this->fornecedor_id ?? null,
            'grupo' => $grupo,
            'grupo_id' => $this->grupo_id ?? null,
        ];
    }
}

