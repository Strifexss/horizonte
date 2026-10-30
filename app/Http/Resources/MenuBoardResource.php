<?php

namespace App\Http\Resources;

use App\Models\MenuBoardItem;
use App\Models\MenuBoardPagina;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuBoardResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'tema' => $this->tema,
            'ativo' => (bool) $this->ativo,
            'paginas_count' => $this->whenCounted('paginas'),
            'ciclo_segundos' => $this->when(isset($this->paginas_sum_duracao_segundos), fn () => (int) $this->paginas_sum_duracao_segundos),
            'atualizado_em' => $this->updated_at?->toDateString(),
            'paginas' => $this->whenLoaded('paginas', fn () => $this->paginas
                ->map(fn (MenuBoardPagina $pagina) => $this->pagina($pagina))
                ->values()),
        ];
    }

    /**
     * Na listagem vai só o resumo; no editor vão também a configuração, a imagem e os itens.
     *
     * @return array<string, mixed>
     */
    private function pagina(MenuBoardPagina $pagina): array
    {
        $resumo = [
            'nome' => $pagina->nome,
            'layout' => $pagina->layout,
            'duracao_segundos' => $pagina->duracao_segundos,
        ];

        if (! $pagina->relationLoaded('itens')) {
            return $resumo;
        }

        return [
            ...$resumo,
            'configuracao' => (object) ($pagina->configuracao ?? []),
            'imagem_atual' => $pagina->imagem_path,
            'imagem_url' => $pagina->imagem_url,
            'itens' => $pagina->itens
                ->map(fn (MenuBoardItem $item) => [
                    'produto_id' => $item->produto_id,
                    'destaque' => (bool) $item->destaque,
                ])
                ->values(),
        ];
    }
}
