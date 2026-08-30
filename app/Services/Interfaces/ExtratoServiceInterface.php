<?php

namespace App\Services\Interfaces;

interface ExtratoServiceInterface extends AbstractServiceInterface
{
    public function index($data = null);
    public function show(int $id);
}

