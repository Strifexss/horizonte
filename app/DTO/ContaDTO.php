<?php

namespace App\DTO;

class ContaDTO extends Dto
{
    public string $nome;
    public ?string $descricao = null;
    public ?string $usuario_id = null;
}

