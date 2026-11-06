<?php

namespace App\Services\Interfaces;

use App\DTO\ProdutoDTO;
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
    public function ativosDaEmpresa(int $empresaId): Collection;

    /**
     * Grava a foto do produto do usuário autenticado, substituindo a anterior.
     */
    public function salvarFoto(int $id, UploadedFile $foto): Produto;

    /**
     * Remove a foto do produto do usuário autenticado.
     */
    public function removerFoto(int $id): Produto;

    /**
     * Cria (sem `$id`) ou atualiza o produto e aplica a foto do formulário numa transação só:
     * arquivo novo substitui a foto; sem arquivo, `$removerFoto` apaga a atual.
     */
    public function salvarComFoto(?int $id, ProdutoDTO $dados, ?UploadedFile $foto, bool $removerFoto): Produto;

    /**
     * Marca ou desmarca o produto da Empresa como atalho da Nova Venda.
     */
    public function marcarFavorito(int $id, bool $favorito): Produto;
}
