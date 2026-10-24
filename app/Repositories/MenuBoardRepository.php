<?php

namespace App\Repositories;

use App\Models\MenuBoard;
use App\Models\MenuBoardItem;
use App\Repositories\Interfaces\MenuBoardRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class MenuBoardRepository extends AbstractRepository implements MenuBoardRepositoryInterface
{
    public function __construct(MenuBoard $menuBoard)
    {
        parent::__construct($menuBoard);
    }

    public function indexComContagens(int $usuarioId): Collection
    {
        return $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->withCount([
                'itens',
                'itens as destaques_count' => fn (Builder $query) => $query->where('destaque', true),
            ])
            ->orderByDesc('ativo')
            ->orderByDesc('updated_at')
            ->get();
    }

    public function findForUsuario(int $id, int $usuarioId): MenuBoard
    {
        return $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->findOrFail($id);
    }

    public function findComItens(int $id, int $usuarioId): MenuBoard
    {
        return $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->with('itens')
            ->findOrFail($id);
    }

    public function sincronizarItens(int $menuBoardId, array $itens): void
    {
        MenuBoardItem::query()->where('menu_board_id', $menuBoardId)->delete();

        foreach (array_values($itens) as $ordem => $item) {
            MenuBoardItem::query()->create([
                'menu_board_id' => $menuBoardId,
                'produto_id' => $item['produto_id'],
                'destaque' => $item['destaque'],
                'ordem' => $ordem,
            ]);
        }
    }

    public function travarDoUsuario(int $usuarioId): void
    {
        $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->lockForUpdate()
            ->pluck('id');
    }

    public function desativarDoUsuario(int $usuarioId): int
    {
        return $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->where('ativo', true)
            ->update(['ativo' => false]);
    }

    public function marcarAtivo(int $id): void
    {
        $this->model->newQuery()->whereKey($id)->update(['ativo' => true]);
    }

    public function findAtivoDoUsuario(int $usuarioId): ?MenuBoard
    {
        return $this->model->newQuery()
            ->where('usuario_id', $usuarioId)
            ->where('ativo', true)
            ->with(['itens' => fn ($query) => $query
                ->whereHas('produto', fn (Builder $produto) => $produto->where('ativo', true))
                ->with('produto')])
            ->first();
    }
}
