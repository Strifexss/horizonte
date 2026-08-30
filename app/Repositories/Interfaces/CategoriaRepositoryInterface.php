<?php

namespace App\Repositories\Interfaces;

interface CategoriaRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Autocomplete por nome.
     *
     * @param string|null $q
     * @return mixed
     */
    public function autocomplete($q = null);
}

