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

    public float $valor_pago;

    public int $qtd_parcelas;

    public ?int $produto_id = null;

    public ?int $funcionario_id = null;
}
