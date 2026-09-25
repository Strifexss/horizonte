<?php

namespace App\Repositories;

use App\DTO\Dto;
use App\Repositories\Interfaces\AbstractRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AbstractRepository implements AbstractRepositoryInterface
{
    public function __construct(
        protected Model $model
    ) {}

    public function store($data)
    {
        if ($data instanceof Dto) {
            $data = $data->all();
        }

        return $this->model->create($data);
    }

    public function index($data = null)
    {
        $query = $this->model->newQuery();

        if (Auth::check() && Schema::hasColumn($this->model->getTable(), 'usuario_id')) {
            $query->where('usuario_id', Auth::id());
        }

        return $query->get();
    }

    public function find(int $id): Model
    {
        return $this->model->findOrFail($id);
    }

    public function update($id, $data)
    {
        if ($data instanceof Dto) {
            $data = $data->all();
        }

        $model = $this->model->findOrFail($id);
        $model->update($data);

        return $model;
    }

    public function delete($id)
    {
        $model = $this->model->findOrFail($id);

        return $model->delete();
    }

    public function autocomplete($q = null)
    {
        $query = $this->model->newQuery();

        if ($q !== null && $q !== '') {
            $this->applyAccentInsensitiveLike($query, 'nome', $q);
        }

        if (Schema::hasColumn($this->model->getTable(), 'usuario_id') && Auth::check()) {
            $query->where('usuario_id', Auth::id());
        }

        return $query->limit(20)->get(['id', 'nome']);
    }

    /**
     * Filtra por coluna textual ignorando diferenças de acento/caixa.
     * Ex.: "Pao" encontra "Pão".
     */
    protected function applyAccentInsensitiveLike(Builder $query, string $column, string $term): void
    {
        $needle = mb_strtolower(Str::ascii($term), 'UTF-8');
        $needle = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $needle);

        $expression = $this->sqlUnaccentLowerExpression($column);

        $query->whereRaw("{$expression} LIKE ? ESCAPE '\\'", ['%'.$needle.'%']);
    }

    protected function sqlUnaccentLowerExpression(string $column): string
    {
        $wrapped = $this->model->getConnection()->getQueryGrammar()->wrap($column);
        $expression = "lower({$wrapped})";

        $replacements = [
            'á' => 'a', 'à' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a',
            'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
            'í' => 'i', 'ì' => 'i', 'î' => 'i', 'ï' => 'i',
            'ó' => 'o', 'ò' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o',
            'ú' => 'u', 'ù' => 'u', 'û' => 'u', 'ü' => 'u',
            'ç' => 'c', 'ñ' => 'n',
        ];

        foreach ($replacements as $from => $to) {
            $expression = "replace({$expression}, '{$from}', '{$to}')";
        }

        return $expression;
    }
}
