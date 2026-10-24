<?php

namespace App\DTO;

class VendaSearchDTO extends Dto
{
    public ?string $data_inicio = null;

    public ?string $data_fim = null;

    public ?int $forma_pagamento_id = null;

    public string $status = 'todos';

    public int $per_page = 20;

    public int $page = 1;

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        $forma = $data['forma_pagamento_id'] ?? null;
        $data['forma_pagamento_id'] = $forma !== null && $forma !== '' ? (int) $forma : null;

        $status = is_string($data['status'] ?? null) ? $data['status'] : 'todos';
        $data['status'] = in_array($status, ['todos', 'aberta', 'fechada', 'cancelada'], true) ? $status : 'todos';

        $perPage = isset($data['per_page']) ? (int) $data['per_page'] : 20;
        $data['per_page'] = in_array($perPage, [10, 20, 25, 50], true) ? $perPage : 20;

        $page = isset($data['page']) ? (int) $data['page'] : 1;
        $data['page'] = $page >= 1 ? $page : 1;

        return parent::fromArray($data);
    }
}
