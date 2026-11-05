<?php

namespace App\Repositories\Interfaces;

interface ConfiguracaoRepositoryInterface extends AbstractRepositoryInterface
{
    public function valor(string $chave): ?string;

    public function definir(string $chave, ?string $valor): void;
}
