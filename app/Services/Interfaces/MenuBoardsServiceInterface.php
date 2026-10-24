<?php

namespace App\Services\Interfaces;

use App\DTO\MenuBoardDTO;
use App\Models\MenuBoard;
use Illuminate\Support\Collection;

interface MenuBoardsServiceInterface extends AbstractServiceInterface
{
    /**
     * @return Collection<int, MenuBoard>
     */
    public function indexDoUsuario(int $usuarioId): Collection;

    public function findComItens(int $id, int $usuarioId): MenuBoard;

    /**
     * @param  MenuBoardDTO  $data
     */
    public function store($data);

    /**
     * @param  MenuBoardDTO  $data
     */
    public function update($id, $data);

    /**
     * Torna o board o único ativo do usuário na TV.
     */
    public function ativar(int $id, int $usuarioId): MenuBoard;

    public function findAtivoDoUsuario(int $usuarioId): ?MenuBoard;
}
