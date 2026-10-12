<?php

namespace App\DTO;

class UsuarioDTO extends Dto
{
    public string $name;

    public string $email;

    public ?string $password = null;
}
