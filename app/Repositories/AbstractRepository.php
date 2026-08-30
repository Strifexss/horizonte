<?php

namespace App\Repositories;

use App\DTO\Dto;
use Illuminate\Database\Eloquent\Model;
use App\Repositories\Interfaces\AbstractRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class AbstractRepository implements AbstractRepositoryInterface
{
    public function __construct(
        protected Model $model
    ){}

    public function store($data)
    {
        if($data instanceof Dto) {
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

    public function find(int $id):Model
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
}