<?php

namespace App\Http\Controllers;

use App\Services\Interfaces\TvPareamentoServiceInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class TvPareamentoController extends Controller
{
    public function __construct(
        private TvPareamentoServiceInterface $tvPareamentoService
    ) {}

    public function store(Request $request)
    {
        try {
            $this->tvPareamentoService->gerarPin((int) $request->user()->id);

            return redirect()->back()->with('success', 'Novo PIN gerado. Digite-o na TV.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao gerar PIN: '.$e->getMessage());
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $this->tvPareamentoService->revogar((int) $id, (int) $request->user()->id);

            return redirect()->back()->with('success', 'TV desconectada.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao desconectar TV: '.$e->getMessage());
        }
    }
}
