<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClienteResource extends JsonResource
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
            'telefone' => $this->telefone,
            'documento' => $this->documento,
            'email' => $this->email,
            'observacao' => $this->observacao,
            'ativo' => (bool) $this->ativo,
            'padrao' => $this->ehPadrao(),
        ];
    }
}
