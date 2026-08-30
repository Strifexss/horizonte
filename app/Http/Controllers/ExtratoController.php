<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Services\Interfaces\CategoriaServiceInterface;

class ExtratoController extends FinanceiroAbstractController
{
    public function __construct(
        private CategoriaServiceInterface $categoriaService
    ){}

    public function index()
    {
        return Inertia::render('extrato/index', [
            'categorias' => Inertia::lazy(fn () => $this->categoriaService->index()),
        ]);
    }
}