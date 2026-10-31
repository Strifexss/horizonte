<?php

namespace App\DTO;

class SegmentoDTO extends Dto
{
    public string $nome;

    public ?string $descricao = null;

    /** @var list<string> */
    public array $modulos = [];

    public bool $ativo = true;
}
