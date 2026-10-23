<?php

namespace App\DTO;

class ProdutoSearchDTO extends Dto
{
    public ?string $busca = null;

    public int $per_page = 20;

    public int $page = 1;

    public ?string $sort = 'nome';

    public ?string $sort_dir = 'asc';

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        if (array_key_exists('busca', $data)) {
            $busca = is_string($data['busca']) ? trim($data['busca']) : '';
            $data['busca'] = $busca !== '' ? $busca : null;
        } else {
            $data['busca'] = null;
        }

        $perPage = isset($data['per_page']) ? (int) $data['per_page'] : 20;
        $data['per_page'] = in_array($perPage, [10, 20, 25, 50], true) ? $perPage : 20;

        $page = isset($data['page']) ? (int) $data['page'] : 1;
        $data['page'] = $page >= 1 ? $page : 1;

        $sort = is_string($data['sort'] ?? null) ? $data['sort'] : 'nome';
        $data['sort'] = in_array($sort, ['nome', 'preco_compra', 'preco_venda', 'ativo'], true) ? $sort : 'nome';

        $dir = is_string($data['sort_dir'] ?? null) ? strtolower($data['sort_dir']) : 'asc';
        $data['sort_dir'] = in_array($dir, ['asc', 'desc'], true) ? $dir : 'asc';

        return parent::fromArray($data);
    }
}
