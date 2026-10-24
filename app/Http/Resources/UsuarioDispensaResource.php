<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioDispensaResource extends JsonResource
{
    public function __construct(mixed $resource, private int $novidadeId)
    {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $rota = ['id' => $this->novidadeId, 'usuarioId' => $this->id];

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'dispensada_em' => $this->dispensada_em?->toDateString(),
            'urls' => [
                'marcar' => route('admin.novidades.dispensas.store', $rota),
                'desmarcar' => route('admin.novidades.dispensas.destroy', $rota),
            ],
        ];
    }
}
