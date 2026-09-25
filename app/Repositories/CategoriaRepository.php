<?php

namespace App\Repositories;

use App\Models\Categoria;
use App\Repositories\Interfaces\CategoriaRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class CategoriaRepository extends AbstractRepository implements CategoriaRepositoryInterface
{
    public function __construct(
        Categoria $categoria
    ) {
        parent::__construct($categoria);
    }

    public function index($data = null)
    {
        $query = $this->model->newQuery();

        if (Auth::check()) {
            $query->where(function ($q) {
                $q->where('usuario_id', Auth::id())
                    ->orWhere('padrao', 1);
            });
        }

        return $query
            ->orderByDesc('padrao')
            ->orderBy('nome')
            ->get();
    }

    /**
     * @param  Categoria  $categoria
     */
    public function delete($categoria)
    {
        return $categoria->delete();
    }

    /**
     * Retorna categorias do usuário e do sistema filtradas pelo termo de busca.
     *
     * @param  string|null  $q
     * @return Collection|array
     */
    public function autocomplete($q = null, ?string $tipo = null)
    {
        $query = $this->model->newQuery();

        if ($q !== null && $q !== '') {
            $this->applyAccentInsensitiveLike($query, 'nome', $q);
        }

        if ($tipo !== null && $tipo !== '') {
            $query->where('tipo', $tipo);
        }

        if (Auth::check()) {
            $query->where(function ($q) {
                $q->where('usuario_id', Auth::id())
                    ->orWhere('padrao', 1);
            });
        }

        return $query
            ->orderByDesc('padrao')
            ->orderBy('nome')
            ->limit(20)
            ->get(['id', 'nome', 'padrao']);
    }
}
