<?php

namespace App\Http\Controllers;

use App\Services\Interfaces\NovidadesServiceInterface;
use Illuminate\Http\Request;

class NovidadesUsuarioController extends Controller
{
    public function __construct(
        private NovidadesServiceInterface $novidadesService
    ) {}

    public function dispensar(Request $request, int $id)
    {
        $this->novidadesService->dispensar($id, $request->user()->id);

        return redirect()->back();
    }
}
