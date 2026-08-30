<?php

namespace App\Repositories;

use App\Models\Categoria;
use App\Repositories\Interfaces\CategoriaRepositoryInterface;

class CategoriaRepository extends AbstractRepository implements CategoriaRepositoryInterface 
{
    public function __construct(
        Categoria $categoria
    ) {
        parent::__construct($categoria);
    }

    /**
     * @param Categoria $categoria
     */
    public function delete($categoria)
    {
        return $categoria->delete();
    }
}

