<?php

namespace App\DTO;

class CategoriaDTO extends Dto
{
    public string $nome;
    public ?int $padrao = null;
    public ?int $usuario_id = null;
    public string $tipo;
}

