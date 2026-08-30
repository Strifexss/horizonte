<?php

namespace App\Services\Interfaces;

interface AbstractServiceInterface
{
    public function store($data);
    public function index($data = null);
    public function update($id, $data);
    public function delete($id);
    public function autocomplete($q = null);
}