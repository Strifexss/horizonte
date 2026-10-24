<?php

namespace App\Repositories\Interfaces;

use App\Models\MenuBoard;
use Illuminate\Support\Collection;

interface MenuBoardRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Boards do usuário com a contagem de itens e destaques.
     *
     * @return Collection<int, MenuBoard>
     */
    public function indexComContagens(int $usuarioId): Collection;

    /**
     * Garante que o board pertence ao usuário informado.
     */
    public function findForUsuario(int $id, int $usuarioId): MenuBoard;

    /**
     * Board do usuário com os itens carregados.
     */
    public function findComItens(int $id, int $usuarioId): MenuBoard;

    /**
     * Substitui os itens do board pela lista informada, na ordem recebida.
     *
     * @param  list<array{produto_id: int, destaque: bool}>  $itens
     */
    public function sincronizarItens(int $menuBoardId, array $itens): void;

    /**
     * Desmarca o board ativo do usuário.
     */
    public function desativarDoUsuario(int $usuarioId): int;

    public function marcarAtivo(int $id): void;

    /**
     * Board ativo do usuário, com itens e produtos ativos carregados.
     */
    public function findAtivoDoUsuario(int $usuarioId): ?MenuBoard;
}
