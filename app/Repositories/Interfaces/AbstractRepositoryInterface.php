<?php

namespace App\Repositories\Interfaces;

interface AbstractRepositoryInterface 
{
    public function store($data);
    public function index($data = null);
    public function update($id, $data);
    public function delete($id);
}