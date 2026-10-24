<?php

namespace App\DTO;

class ProdutoDTO extends Dto
{
    public string $nome;

    public float $preco_compra;

    public float $preco_venda = 0;

    public bool $ativo = true;

    public ?int $usuario_id = null;

    public ?int $fornecedor_id = null;

    public ?int $grupo_id = null;

    public ?string $descricao = null;

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        if (array_key_exists('preco_compra', $data) && $data['preco_compra'] !== null && $data['preco_compra'] !== '') {
            $data['preco_compra'] = (float) $data['preco_compra'];
        }

        if (array_key_exists('preco_venda', $data) && $data['preco_venda'] !== null && $data['preco_venda'] !== '') {
            $data['preco_venda'] = (float) $data['preco_venda'];
        } else {
            $data['preco_venda'] = 0.0;
        }

        $data['ativo'] = filter_var($data['ativo'] ?? true, FILTER_VALIDATE_BOOLEAN);

        if (array_key_exists('usuario_id', $data) && $data['usuario_id'] !== null && $data['usuario_id'] !== '') {
            $data['usuario_id'] = (int) $data['usuario_id'];
        }

        if (array_key_exists('fornecedor_id', $data) && $data['fornecedor_id'] !== null && $data['fornecedor_id'] !== '') {
            $data['fornecedor_id'] = (int) $data['fornecedor_id'];
        } else {
            $data['fornecedor_id'] = null;
        }

        if (array_key_exists('grupo_id', $data) && $data['grupo_id'] !== null && $data['grupo_id'] !== '') {
            $data['grupo_id'] = (int) $data['grupo_id'];
        } else {
            $data['grupo_id'] = null;
        }

        if (array_key_exists('descricao', $data)) {
            $data['descricao'] = trim((string) ($data['descricao'] ?? ''));
        }

        return parent::fromArray($data);
    }
}
