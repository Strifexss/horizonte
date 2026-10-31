<?php

namespace App\Repositories;

use App\Models\Segmento;
use App\Repositories\Interfaces\SegmentoRepositoryInterface;
use Illuminate\Support\Collection;

class SegmentoRepository extends AbstractRepository implements SegmentoRepositoryInterface
{
    public function __construct(Segmento $segmento)
    {
        parent::__construct($segmento);
    }

    public function index($data = null)
    {
        return $this->model->newQuery()
            ->withCount('empresas')
            ->orderByDesc('ativo')
            ->orderBy('nome')
            ->get();
    }

    public function ativos(): Collection
    {
        return $this->model->newQuery()->where('ativo', true)->orderBy('id')->get();
    }

    public function chaveEmUso(string $chave): bool
    {
        return $this->model->newQuery()->where('chave', $chave)->exists();
    }

    public function contarEmpresas(int $id): int
    {
        return $this->model->newQuery()->findOrFail($id)->empresas()->count();
    }
}
