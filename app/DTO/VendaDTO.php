<?php

namespace App\DTO;

class VendaDTO extends Dto
{
    public int $usuario_id;

    public ?string $observacao = null;

    /**
     * @var list<array{produto_id: int, quantidade: float, valor_unitario: float}>
     */
    public array $itens = [];

    /**
     * @var list<array{forma_pagamento_id: int, valor: float}>
     */
    public array $pagamentos = [];

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        $data['itens'] = array_values(array_map(fn (array $item): array => [
            'produto_id' => (int) $item['produto_id'],
            'quantidade' => (float) $item['quantidade'],
            'valor_unitario' => (float) $item['valor_unitario'],
        ], $data['itens'] ?? []));

        $data['pagamentos'] = array_values(array_map(fn (array $pagamento): array => [
            'forma_pagamento_id' => (int) $pagamento['forma_pagamento_id'],
            'valor' => (float) $pagamento['valor'],
        ], $data['pagamentos'] ?? []));

        $observacao = $data['observacao'] ?? null;
        $data['observacao'] = is_string($observacao) && trim($observacao) !== '' ? trim($observacao) : null;

        return parent::fromArray($data);
    }
}
