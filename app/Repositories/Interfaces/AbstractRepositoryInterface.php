<?php

namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Model;

interface AbstractRepositoryInterface 
{
    public function store($data);
    public function index($data = null);
    public function update($id, $data);
    public function find(int $id):Model;
    public function delete($id);
    public function autocomplete($q = null);
}