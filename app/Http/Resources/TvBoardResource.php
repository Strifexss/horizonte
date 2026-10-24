<?php

namespace App\Http\Resources;

use App\Models\MenuBoardItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Dados públicos do board exibido na TV: sem custos nem dados financeiros.
 */
class TvBoardResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        [$destaques, $itens] = $this->itens->partition(fn (MenuBoardItem $item) => $item->destaque);

        return [
            'nome' => $this->nome,
            'tema' => $this->tema,
            'estabelecimento' => $this->user?->name,
            'destaques' => $destaques->map(fn (MenuBoardItem $item) => $this->produtoNaTv($item))->values(),
            'itens' => $itens->map(fn (MenuBoardItem $item) => $this->produtoNaTv($item))->values(),
        ];
    }

    /**
     * @return array{id: int, nome: string, descricao: ?string, preco: string, foto_url: ?string}
     */
    private function produtoNaTv(MenuBoardItem $item): array
    {
        return [
            'id' => $item->produto->id,
            'nome' => $item->produto->nome,
            'descricao' => $item->produto->descricao ?: null,
            'preco' => number_format((float) $item->produto->preco_venda, 2, '.', ''),
            'foto_url' => $item->produto->foto_url,
        ];
    }
}
