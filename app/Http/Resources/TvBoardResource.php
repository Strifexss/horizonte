<?php

namespace App\Http\Resources;

use App\Models\MenuBoardItem;
use App\Models\MenuBoardPagina;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * Dados públicos do board exibido na TV: sem custos nem dados financeiros.
 * Páginas que ficaram sem conteúdo (produto desativado, grupo vazio, sem imagem) não vão para a TV.
 */
class TvBoardResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'nome' => $this->nome,
            'tema' => $this->tema,
            'paginas' => $this->paginas
                ->map(fn (MenuBoardPagina $pagina) => $this->paginaNaTv($pagina))
                ->filter()
                ->values(),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function paginaNaTv(MenuBoardPagina $pagina): ?array
    {
        $base = ['layout' => $pagina->layout, 'duracao_segundos' => $pagina->duracao_segundos];
        $produtos = $pagina->itens->map(fn (MenuBoardItem $item) => $item->produto);

        $conteudo = match ($pagina->layout) {
            MenuBoardPagina::LAYOUT_DESTAQUES_GRADE => $this->destaquesGrade($pagina),
            MenuBoardPagina::LAYOUT_CATEGORIA => $this->comItens(['titulo' => $pagina->grupo_nome], $this->produtosDoGrupo($pagina)),
            MenuBoardPagina::LAYOUT_BANNER => $pagina->imagem_url ? ['imagem_url' => $pagina->imagem_url] : null,
            MenuBoardPagina::LAYOUT_IMAGEM_LISTA => $pagina->imagem_url ? [
                'imagem_url' => $pagina->imagem_url,
                'titulo' => $pagina->config('titulo'),
                'itens' => $this->produtosNaTv($this->fonteCategoria($pagina) ? $this->produtosDoGrupo($pagina) : $produtos),
            ] : null,
            MenuBoardPagina::LAYOUT_AVISO => [
                'titulo' => $pagina->config('titulo'),
                'texto' => $pagina->config('texto'),
                'qr' => $pagina->config('qr_ativo') && $pagina->config('qr_link')
                    ? ['link' => $pagina->config('qr_link'), 'legenda' => $pagina->config('qr_legenda')]
                    : null,
            ],
            MenuBoardPagina::LAYOUT_PRODUTO_DESTAQUE => $produtos->isEmpty() ? null : [
                'produto' => $this->produtoNaTv($produtos->first(), comDescricao: (bool) $pagina->config('mostrar_descricao', true)),
                'selo' => $pagina->config('selo'),
                'chamada' => $pagina->config('chamada'),
                'foto_posicao' => $pagina->config('foto_posicao', 'direita'),
            ],
            default => null,
        };

        return $conteudo === null ? null : [...$base, ...$conteudo];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function destaquesGrade(MenuBoardPagina $pagina): ?array
    {
        [$destaques, $grade] = $pagina->itens->partition(fn (MenuBoardItem $item) => $item->destaque);
        $destaques = $destaques->map(fn (MenuBoardItem $item) => $item->produto);

        if ($this->fonteCategoria($pagina)) {
            $grade = $this->produtosDoGrupo($pagina);
            if ($pagina->config('ocultar_destaques')) {
                $grade = $grade->reject(fn (Produto $produto) => $destaques->contains('id', $produto->id));
            }
        } else {
            $grade = $grade->map(fn (MenuBoardItem $item) => $item->produto);
        }

        if ($destaques->isEmpty() && $grade->isEmpty()) {
            return null;
        }

        return ['destaques' => $this->produtosNaTv($destaques), 'itens' => $this->produtosNaTv($grade)];
    }

    /**
     * @param  array<string, mixed>  $dados
     * @param  Collection<int, Produto>  $produtos
     * @return array<string, mixed>|null
     */
    private function comItens(array $dados, Collection $produtos): ?array
    {
        return $produtos->isEmpty() ? null : [...$dados, 'itens' => $this->produtosNaTv($produtos)];
    }

    private function fonteCategoria(MenuBoardPagina $pagina): bool
    {
        return $pagina->config('fonte') === MenuBoardPagina::FONTE_CATEGORIA;
    }

    /**
     * @return Collection<int, Produto>
     */
    private function produtosDoGrupo(MenuBoardPagina $pagina): Collection
    {
        return $pagina->relationLoaded('produtosDoGrupo') ? $pagina->getRelation('produtosDoGrupo') : collect();
    }

    /**
     * @param  Collection<int, Produto>  $produtos
     * @return Collection<int, array<string, mixed>>
     */
    private function produtosNaTv(Collection $produtos): Collection
    {
        return $produtos->map(fn (Produto $produto) => $this->produtoNaTv($produto))->values();
    }

    /**
     * @return array{id: int, nome: string, descricao: ?string, preco: string, foto_url: ?string}
     */
    private function produtoNaTv(Produto $produto, bool $comDescricao = true): array
    {
        return [
            'id' => $produto->id,
            'nome' => $produto->nome,
            'descricao' => $comDescricao ? ($produto->descricao ?: null) : null,
            'preco' => number_format((float) $produto->preco_venda, 2, '.', ''),
            'foto_url' => $produto->foto_url,
        ];
    }
}
