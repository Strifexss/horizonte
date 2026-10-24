<?php

namespace App\DTO;

use Illuminate\Http\UploadedFile;

class NovidadeDTO extends Dto
{
    public string $titulo;

    public string $descricao;

    public string $categoria;

    public ?string $cta_url = null;

    public bool $popup_automatico = false;

    /**
     * @var list<UploadedFile>
     */
    public array $imagens = [];

    /**
     * Ids de imagens da própria novidade que devem sair dela.
     *
     * @var list<int>
     */
    public array $remover_imagens = [];
}
