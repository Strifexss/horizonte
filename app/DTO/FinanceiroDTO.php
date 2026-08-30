<?php

namespace App\DTO;

class FinanceiroDTO extends Dto
{
    public ?int $id = null;
    public string $descricao;
    public float $valor;
    public string $tipo;
    public int $categoria_id;
    public int $conta_id;
    public int $usuario_id;
}

