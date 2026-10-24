<?php

namespace App\Http\Resources;

use App\Models\VendaItem;
use App\Models\VendaPagamento;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendaResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $totalPago = $this->pagamentos->sum(fn (VendaPagamento $pagamento): float => (float) $pagamento->valor);

        return [
            'id' => $this->id,
            'status' => $this->status,
            'total' => number_format((float) $this->total, 2, '.', ''),
            'total_pago' => number_format($totalPago, 2, '.', ''),
            'data_venda' => $this->data_venda?->toIso8601String(),
            'observacao' => $this->observacao,
            'itens' => $this->itens->map(fn (VendaItem $item): array => [
                'id' => $item->id,
                'produto_id' => $item->produto_id,
                'produto' => $item->produto ? ['id' => $item->produto->id, 'nome' => $item->produto->nome] : null,
                'quantidade' => rtrim(rtrim(number_format((float) $item->quantidade, 3, '.', ''), '0'), '.'),
                'valor_unitario' => number_format((float) $item->valor_unitario, 2, '.', ''),
                'valor_total' => number_format((float) $item->valor_total, 2, '.', ''),
            ])->values(),
            'pagamentos' => $this->pagamentos->map(fn (VendaPagamento $pagamento): array => [
                'id' => $pagamento->id,
                'forma_pagamento_id' => $pagamento->forma_pagamento_id,
                'forma_pagamento' => $pagamento->formaPagamento
                    ? ['id' => $pagamento->formaPagamento->id, 'nome' => $pagamento->formaPagamento->nome]
                    : null,
                'valor' => number_format((float) $pagamento->valor, 2, '.', ''),
            ])->values(),
        ];
    }
}
