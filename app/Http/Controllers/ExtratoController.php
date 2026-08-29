<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ExtratoController extends FinanceiroAbstractController
{
    public function index()
    {
        return Inertia::render('extrato/index');
    }
}