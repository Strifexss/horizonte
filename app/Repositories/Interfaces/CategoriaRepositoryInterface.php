<?php

namespace App\Repositories\Interfaces;

use App\Models\Categoria;

interface CategoriaRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Autocomplete por nome.
     *
     * @param  string|null  $q
     * @return mixed
     */
    public function autocomplete($q = null, ?string $tipo = null);

    /**
     * Categoria do sistema (padrão, sem dono) pelo nome.
     */
    public function findDoSistemaPorNome(string $nome): Categoria;
}
