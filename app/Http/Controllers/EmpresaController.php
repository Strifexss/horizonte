<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmpresaNomeRequest;
use App\Services\Interfaces\EmpresasServiceInterface;
use Illuminate\Http\RedirectResponse;

class EmpresaController extends Controller
{
    public function __construct(
        private EmpresasServiceInterface $empresasService
    ) {}

    /**
     * Confirma o nome oficial da Empresa ativa (modal dos clientes antigos).
     */
    public function confirmarNome(EmpresaNomeRequest $request): RedirectResponse
    {
        $this->empresasService->confirmarNome($request->user()->empresa(), $request->validated('nome'));

        return back();
    }
}
