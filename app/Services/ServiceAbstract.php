<?php

namespace App\Services;

use App\Repositories\Interfaces\AbstractRepositoryInterface;

class ServiceAbstract
{
    public function __construct(
        protected AbstractRepositoryInterface $repository
    ){}

    public function store($data)
    {
        return $this->repository->store($data);
    }

    public function index($data = null)
    {
        return $this->repository->index($data);
    }

    public function update($id, $data)
    {
        return $this->repository->update($id, $data);
    }

    public function delete($id)
    {
        return $this->repository->delete($id);
    }
}
