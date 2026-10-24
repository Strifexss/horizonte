<?php

namespace App\Services;

use App\DTO\MenuBoardDTO;
use App\Models\MenuBoard;
use App\Repositories\Interfaces\MenuBoardRepositoryInterface;
use App\Services\Interfaces\MenuBoardsServiceInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MenuBoardsService extends ServiceAbstract implements MenuBoardsServiceInterface
{
    public function __construct(
        private MenuBoardRepositoryInterface $menuBoardRepository
    ) {
        parent::__construct($menuBoardRepository);
    }

    public function indexDoUsuario(int $usuarioId): Collection
    {
        return $this->menuBoardRepository->indexComContagens($usuarioId);
    }

    public function findComItens(int $id, int $usuarioId): MenuBoard
    {
        return $this->menuBoardRepository->findComItens($id, $usuarioId);
    }

    /**
     * @param  MenuBoardDTO  $data
     */
    public function store($data)
    {
        return DB::transaction(function () use ($data) {
            $board = $this->menuBoardRepository->store($data->dadosDoBoard());
            $this->menuBoardRepository->sincronizarItens($board->id, $data->itens);

            return $board;
        });
    }

    /**
     * @param  MenuBoardDTO  $data
     */
    public function update($id, $data)
    {
        $this->menuBoardRepository->findForUsuario((int) $id, (int) Auth::id());

        return DB::transaction(function () use ($id, $data) {
            $board = $this->menuBoardRepository->update($id, $data->dadosDoBoard());
            $this->menuBoardRepository->sincronizarItens((int) $id, $data->itens);

            return $board;
        });
    }

    public function delete($id)
    {
        $this->menuBoardRepository->findForUsuario((int) $id, (int) Auth::id());

        return parent::delete($id);
    }

    /**
     * Os boards do usuário ficam travados até o commit, então ativações simultâneas entram em fila
     * e só um board termina ativo.
     */
    public function ativar(int $id, int $usuarioId): MenuBoard
    {
        return DB::transaction(function () use ($id, $usuarioId) {
            $this->menuBoardRepository->travarDoUsuario($usuarioId);
            $this->menuBoardRepository->findForUsuario($id, $usuarioId);
            $this->menuBoardRepository->desativarDoUsuario($usuarioId);
            $this->menuBoardRepository->marcarAtivo($id);

            return $this->menuBoardRepository->findForUsuario($id, $usuarioId);
        });
    }

    public function findAtivoDoUsuario(int $usuarioId): ?MenuBoard
    {
        return $this->menuBoardRepository->findAtivoDoUsuario($usuarioId);
    }
}
