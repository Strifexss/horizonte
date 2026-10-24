<?php

namespace App\DTO;

class FormaPagamentoDTO extends Dto
{
    public string $nome;

    public ?bool $ativo = true;

    public ?bool $baixa_automatica = true;

    public ?int $usuario_id = null;
}
