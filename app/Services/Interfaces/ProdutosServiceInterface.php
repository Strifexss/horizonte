<?php

namespace App\Services\Interfaces;

use App\DTO\ProdutoSearchDTO;
use App\Models\Produto;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

interface ProdutosServiceInterface extends AbstractServiceInterface
{
    public function indexFiltrado(ProdutoSearchDTO $filters): LengthAwarePaginator;

    /**
     * Produtos ativos do usuário, disponíveis para os Menu Boards.
     *
     * @return Collection<int, Produto>
     */
    public function ativosDoUsuario(int $usuarioId): Collection;

    /**
     * Grava a foto do produto do usuário autenticado, substituindo a anterior.
     */
    public function salvarFoto(int $id, UploadedFile $foto): Produto;

    /**
     * Remove a foto do produto do usuário autenticado.
     */
    public function removerFoto(int $id): Produto;
}
