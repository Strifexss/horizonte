<?php

namespace App\DTO;

class EmpresasSearchDTO extends Dto
{
    public ?string $busca = null;

    public ?int $segmento_id = null;

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        $busca = isset($data['busca']) && is_string($data['busca']) ? trim($data['busca']) : '';
        $data['busca'] = $busca !== '' ? $busca : null;
        $data['segmento_id'] = isset($data['segmento_id']) && $data['segmento_id'] !== '' ? (int) $data['segmento_id'] : null;

        return parent::fromArray($data);
    }
}
