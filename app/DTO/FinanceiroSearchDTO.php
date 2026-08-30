<?php

namespace App\DTO;

class FinanceiroSearchDTO extends Dto
{
    public ?string $tipo_data = null;

    public ?string $data_inicio = null;

    public ?string $data_fim = null;

    public ?int $conta_id = null;

    public ?int $categoria_id = null;

    public ?string $status = null;

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        if (array_key_exists('conta_id', $data) && $data['conta_id'] !== null && $data['conta_id'] !== '') {
            $data['conta_id'] = (int) $data['conta_id'];
        } else {
            $data['conta_id'] = null;
        }

        if (array_key_exists('categoria_id', $data) && $data['categoria_id'] !== null && $data['categoria_id'] !== '') {
            $data['categoria_id'] = (int) $data['categoria_id'];
        } else {
            $data['categoria_id'] = null;
        }

        return parent::fromArray($data);
    }
}
