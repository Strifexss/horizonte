<?php

namespace App\DTO;

class FinanceiroParcelaDTO extends Dto
{
    public ?string $descricao = null;
    public ?string $data_vencimento = null;
    public ?string $data_competencia = null;
    public ?float $valor = null;
    public ?float $valor_pago = null;
    public ?int $parcela = null;
    public ?int $categoria_id = null;
    public ?int $conta_id = null;
    public ?int $financeiro_id = null;
    public ?int $usuario_id = null;
}