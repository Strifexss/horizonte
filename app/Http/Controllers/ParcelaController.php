<?php

namespace App\Http\Controllers;

use App\DTO\FinanceiroParcelaDTO;
use App\Exceptions\LancamentoDeVendaException;
use App\Http\Requests\UpdateParcelaRequest;
use App\Services\Interfaces\FinanceiroParcelaServiceInterface;

class ParcelaController extends Controller
{
    public function __construct(
        private FinanceiroParcelaServiceInterface $financeiroParcelaService
    ) {}

    public function update(UpdateParcelaRequest $request, int $id)
    {
        try {
            $this->financeiroParcelaService->update(
                $id, FinanceiroParcelaDTO::fromArray($request->validated())
            );

            return redirect()->route('extrato.index')->with('success', 'Parcela atualizada com sucesso.');
        } catch (LancamentoDeVendaException $e) {
            return redirect()->route('extrato.index')->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->route('extrato.index')->with('error', 'Erro ao atualizar parcela: '.$e->getMessage());
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->financeiroParcelaService->delete($id);

            return redirect()->route('extrato.index')->with('success', 'Parcela excluída com sucesso.');
        } catch (LancamentoDeVendaException $e) {
            return redirect()->route('extrato.index')->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->route('extrato.index')->with('error', 'Erro ao excluir parcela: '.$e->getMessage());
        }
    }
}
