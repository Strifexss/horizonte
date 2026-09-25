<?php

namespace App\DTO;

class FuncionarioDTO extends Dto
{
    public string $nome;

    public float $salario;

    public ?int $usuario_id = null;
}
