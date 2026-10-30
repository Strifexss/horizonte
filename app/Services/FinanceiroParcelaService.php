<?php

namespace App\Services;

use App\DTO\FinanceiroParcelaDTO;
use App\Exceptions\LancamentoDeVendaException;
use App\Models\FinanceiroParcela;
use App\Repositories\Interfaces\FinanceiroParcelaRepositoryInterface;
use App\Services\Interfaces\FinanceiroParcelaServiceInterface;
use Illuminate\Support\Facades\DB;

class FinanceiroParcelaService extends ServiceAbstract implements FinanceiroParcelaServiceInterface
{
    public function __construct(
        private FinanceiroParcelaRepositoryInterface $financeiroParcelaRepository
    ) {
        parent::__construct($financeiroParcelaRepository);
    }

    /**
     * @param  int  $id
     * @param  FinanceiroParcelaDTO  $dto
     */
    public function update($id, $dto)
    {
        $parcela = $this->financeiroParcelaRepository->findDaEmpresaComFinanceiro((int) $id);

        if ($this->veioDeVenda($parcela)) {
            return $this->darBaixaEmParcelaDeVenda($parcela, $dto);
        }

        $data = $dto->all();
        unset($data['forma_pagamento_id']);
        // all() remove nulls; FKs opcionais precisam poder ser limpas explicitamente.
        $data['produto_id'] = $dto->produto_id;
        $data['funcionario_id'] = $dto->funcionario_id;
        if ($dto->quantidade !== null) {
            $data['quantidade'] = $dto->quantidade;
        }

        return DB::transaction(function () use ($parcela, $dto, $data) {
            if ($dto->forma_pagamento_id !== null) {
                $this->financeiroParcelaRepository->updateFormaPagamentoDoFinanceiro(
                    $parcela->financeiro_id,
                    $dto->forma_pagamento_id
                );
            }

            return $this->repository->update($parcela->id, $data);
        });
    }

    /**
     * @param  int  $id
     */
    public function delete($id)
    {
        $parcela = $this->financeiroParcelaRepository->findDaEmpresaComFinanceiro((int) $id);

        if ($this->veioDeVenda($parcela)) {
            throw new LancamentoDeVendaException;
        }

        return parent::delete($parcela->id);
    }

    private function darBaixaEmParcelaDeVenda(FinanceiroParcela $parcela, FinanceiroParcelaDTO $dto): FinanceiroParcela
    {
        $mudouValor = $dto->valor !== null && round($dto->valor, 2) !== round((float) $parcela->valor, 2);
        $mudouForma = $dto->forma_pagamento_id !== null
            && $dto->forma_pagamento_id !== $parcela->financeiro->forma_pagamento_id;

        if ($mudouValor || $mudouForma) {
            throw new LancamentoDeVendaException;
        }

        return $this->repository->update($parcela->id, ['valor_pago' => $dto->valor_pago ?? 0]);
    }

    private function veioDeVenda(FinanceiroParcela $parcela): bool
    {
        return $parcela->financeiro?->venda_id !== null;
    }
}
