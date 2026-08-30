<?php

namespace App\DTO;

class ContaDTO extends Dto
{
    public string $nome;
    public string $descricao;
    public ?string $usuario_id = null;
}

