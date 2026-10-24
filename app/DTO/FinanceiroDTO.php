<?php

namespace App\DTO;

class FinanceiroDTO extends Dto
{
    public ?int $id = null;

    public string $descricao;

    public float $valor;

    public string $tipo;

    public ?int $categoria_id = null;

    public int $conta_id;

    public int $usuario_id;

    public string $data_vencimento;

    public ?string $data_competencia = null;

    public float $valor_pago;

    public int $qtd_parcelas;

    public ?int $produto_id = null;

    public ?int $funcionario_id = null;

    public ?int $quantidade = null;

    public ?int $fornecedor_id = null;

    public int $forma_pagamento_id;

    public ?int $venda_id = null;

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        $competencia = $data['data_competencia'] ?? null;
        $data['data_competencia'] = is_string($competencia) && trim($competencia) !== ''
            ? trim($competencia)
            : null;

        return parent::fromArray($data);
    }
}
