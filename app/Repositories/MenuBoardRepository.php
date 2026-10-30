<?php

namespace App\Repositories;

use App\Models\Grupo;
use App\Models\MenuBoard;
use App\Models\MenuBoardItem;
use App\Models\MenuBoardPagina;
use App\Models\Produto;
use App\Repositories\Interfaces\MenuBoardRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class MenuBoardRepository extends AbstractRepository implements MenuBoardRepositoryInterface
{
    public function __construct(MenuBoard $menuBoard)
    {
        parent::__construct($menuBoard);
    }

    public function indexComContagens(int $empresaId): Collection
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->withCount('paginas')
            ->withSum('paginas', 'duracao_segundos')
            ->with('paginas:id,menu_board_id,ordem,nome,layout,duracao_segundos')
            ->orderByDesc('ativo')
            ->orderByDesc('updated_at')
            ->get();
    }

    public function findDaEmpresa(int $id, int $empresaId): MenuBoard
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);
    }

    public function findComPaginas(int $id, int $empresaId): MenuBoard
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->with(['paginas.itens' => fn ($query) => $query->whereHas('produto', fn (Builder $produto) => $produto->where('ativo', true))])
            ->findOrFail($id);
    }

    public function sincronizarPaginas(int $menuBoardId, array $paginas): void
    {
        $paginaIds = MenuBoardPagina::query()->where('menu_board_id', $menuBoardId)->pluck('id');
        MenuBoardItem::query()->whereIn('menu_board_pagina_id', $paginaIds)->delete();
        MenuBoardPagina::query()->whereKey($paginaIds)->delete();

        foreach (array_values($paginas) as $ordem => $pagina) {
            $criada = MenuBoardPagina::query()->create([
                'menu_board_id' => $menuBoardId,
                'ordem' => $ordem,
                'nome' => $pagina['nome'],
                'layout' => $pagina['layout'],
                'duracao_segundos' => $pagina['duracao_segundos'],
                'configuracao' => $pagina['configuracao'],
                'imagem_path' => $pagina['imagem_path'],
            ]);

            foreach (array_values($pagina['itens']) as $posicao => $item) {
                MenuBoardItem::query()->create([
                    'menu_board_pagina_id' => $criada->id,
                    'produto_id' => $item['produto_id'],
                    'destaque' => $item['destaque'],
                    'ordem' => $posicao,
                ]);
            }
        }
    }

    public function imagensDoBoard(int $menuBoardId): array
    {
        return MenuBoardPagina::query()
            ->where('menu_board_id', $menuBoardId)
            ->whereNotNull('imagem_path')
            ->pluck('imagem_path')
            ->all();
    }

    public function salvarArquivoImagem(UploadedFile $imagem, int $empresaId): string
    {
        return $imagem->store('menu-boards/'.$empresaId, MenuBoardPagina::discoImagens());
    }

    public function apagarArquivoImagem(string $imagemPath): void
    {
        Storage::disk(MenuBoardPagina::discoImagens())->delete($imagemPath);
    }

    public function travarDaEmpresa(int $empresaId): void
    {
        $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->lockForUpdate()
            ->pluck('id');
    }

    public function desativarDaEmpresa(int $empresaId): int
    {
        return $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->where('ativo', true)
            ->update(['ativo' => false]);
    }

    public function marcarAtivo(int $id): void
    {
        $this->model->newQuery()->whereKey($id)->update(['ativo' => true]);
    }

    public function findAtivoDaEmpresa(int $empresaId): ?MenuBoard
    {
        $board = $this->model->newQuery()
            ->where('empresa_id', $empresaId)
            ->where('ativo', true)
            ->with(['paginas.itens' => fn ($query) => $query
                ->whereHas('produto', fn (Builder $produto) => $produto->where('ativo', true))
                ->with('produto')])
            ->first();

        $board?->paginas->each(fn (MenuBoardPagina $pagina) => $this->carregarGrupo($pagina, $empresaId));

        return $board;
    }

    /**
     * Páginas que listam um grupo recebem os produtos ativos dele e o nome do grupo.
     */
    private function carregarGrupo(MenuBoardPagina $pagina, int $empresaId): void
    {
        $grupoId = $pagina->config('grupo_id');
        $listaGrupo = $pagina->layout === MenuBoardPagina::LAYOUT_CATEGORIA
            || $pagina->config('fonte') === MenuBoardPagina::FONTE_CATEGORIA;

        if (! $listaGrupo || ! $grupoId) {
            return;
        }

        $query = Produto::query()
            ->where('empresa_id', $empresaId)
            ->where('grupo_id', $grupoId)
            ->where('ativo', true);

        match ($pagina->config('ordenacao')) {
            'menor_preco' => $query->orderBy('preco_venda'),
            'maior_preco' => $query->orderByDesc('preco_venda'),
            default => $query->orderBy('nome'),
        };

        $pagina->setRelation('produtosDoGrupo', $query->get());
        $pagina->setAttribute('grupo_nome', Grupo::query()->whereKey($grupoId)->value('nome'));
    }
}
