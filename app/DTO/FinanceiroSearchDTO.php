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

    public ?int $fornecedor_id = null;

    public int $per_page = 20;
    
    /**
     * Campo de ordenação (ex: data, descricao, quantidade, valor, valor_pago)
     *
     * @var string|null
     */
    public ?string $sort = null;

    /**
     * Direção da ordenação: 'asc' ou 'desc'
     *
     * @var string|null
     */
    public ?string $sort_dir = null;

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

        if (array_key_exists('fornecedor_id', $data) && $data['fornecedor_id'] !== null && $data['fornecedor_id'] !== '') {
            $data['fornecedor_id'] = (int) $data['fornecedor_id'];
        } else {
            $data['fornecedor_id'] = null;
        }

        $perPage = isset($data['per_page']) ? (int) $data['per_page'] : 20;
        $data['per_page'] = in_array($perPage, [10, 20, 25, 50], true) ? $perPage : 20;

        if (array_key_exists('busca', $data)) {
            $busca = is_string($data['busca']) ? trim($data['busca']) : '';
            $data['busca'] = $busca !== '' ? $busca : null;
        } else {
            $data['busca'] = null;
        }

        // Ordenação (opcional)
        if (array_key_exists('sort', $data)) {
            $data['sort'] = is_string($data['sort']) && $data['sort'] !== '' ? $data['sort'] : null;
        } else {
            $data['sort'] = null;
        }

        if (array_key_exists('sort_dir', $data)) {
            $dir = is_string($data['sort_dir']) ? strtolower($data['sort_dir']) : '';
            $data['sort_dir'] = in_array($dir, ['asc', 'desc'], true) ? $dir : null;
        } else {
            $data['sort_dir'] = null;
        }

        return parent::fromArray($data);
    }
}
