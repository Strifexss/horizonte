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

    public ?string $busca = null;

    public ?int $produto_id = null;

    public ?int $grupo_id = null;

    public int $per_page = 20;

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

        if (array_key_exists('produto_id', $data) && $data['produto_id'] !== null && $data['produto_id'] !== '') {
            $data['produto_id'] = (int) $data['produto_id'];
        } else {
            $data['produto_id'] = null;
        }

        if (array_key_exists('grupo_id', $data) && $data['grupo_id'] !== null && $data['grupo_id'] !== '') {
            $data['grupo_id'] = (int) $data['grupo_id'];
        } else {
            $data['grupo_id'] = null;
        }

        $perPage = isset($data['per_page']) ? (int) $data['per_page'] : 20;
        $data['per_page'] = in_array($perPage, [10, 20, 25, 50], true) ? $perPage : 20;

        if (array_key_exists('busca', $data)) {
            $busca = is_string($data['busca']) ? trim($data['busca']) : '';
            $data['busca'] = $busca !== '' ? $busca : null;
        } else {
            $data['busca'] = null;
        }

        return parent::fromArray($data);
    }
}
