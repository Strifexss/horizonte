<?php

namespace App\DTO;

class TransferDadosDTO extends Dto
{
    public int $origem_id;

    public int $destino_id;

    /** @var array<string> */
    public array $modulos = [];

    public bool $migrar_relacionamentos = false;

    public bool $confirmacao = false;
}
