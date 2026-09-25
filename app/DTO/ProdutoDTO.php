<?php

namespace App\DTO;

class ProdutoDTO extends Dto
{
    public string $nome;

    public float $preco_compra;

    public ?int $usuario_id = null;
}
