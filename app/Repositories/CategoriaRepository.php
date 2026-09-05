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

    /**
     * Retorna categorias filtradas pelo termo de busca.
     *
     * @param string|null $q
     * @param string|null $tipo
     * @return \Illuminate\Support\Collection|array
     */
    public function autocomplete($q = null, ?string $tipo = null)
    {
        $query = $this->model->newQuery();

        if ($q !== null && $q !== '') {
            $query->where('nome', 'like', '%' . $q . '%');
        }

        if ($tipo !== null && $tipo !== '') {
            $query->where('tipo', $tipo);
        }

        if (\Illuminate\Support\Facades\Schema::hasColumn($this->model->getTable(), 'usuario_id') && \Illuminate\Support\Facades\Auth::check()) {
            $query->where('usuario_id', \Illuminate\Support\Facades\Auth::id());
        }

        return $query->limit(20)->get(['id', 'nome']);
    }
}

