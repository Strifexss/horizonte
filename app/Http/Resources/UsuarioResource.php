<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at?->toDateString(),
            'empresa' => $this->relationLoaded('empresas') ? $this->empresas->first()?->nome : $this->empresa()?->nome,
            'conta_google' => $this->ehContaGoogle(),
            'urls' => [
                'update' => route('admin.usuarios.update', $this->id),
                'destroy' => route('admin.usuarios.destroy', $this->id),
                'entrar_como' => route('admin.usuarios.entrar-como', $this->id),
            ],
        ];
    }
}
