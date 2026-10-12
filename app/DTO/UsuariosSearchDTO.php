<?php

namespace App\DTO;

class UsuariosSearchDTO extends Dto
{
    public ?string $busca = null;

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        $busca = isset($data['busca']) && is_string($data['busca']) ? trim($data['busca']) : '';
        $data['busca'] = $busca !== '' ? $busca : null;

        return parent::fromArray($data);
    }
}
