<?php

namespace App\DTO;

class ContaDTO extends Dto
{
    public string $nome;

    public ?string $descricao = null;

    public ?int $usuario_id = null;

    public ?int $padrao = 0;
}
