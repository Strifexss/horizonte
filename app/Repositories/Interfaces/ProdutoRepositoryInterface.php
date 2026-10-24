<?php

namespace App\Repositories\Interfaces;

use App\DTO\ProdutoSearchDTO;
use App\Models\Produto;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

interface ProdutoRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Remove o vínculo de produto nas parcelas vinculadas.
     */
    public function nullifyProdutoIdOnParcelas(int $produtoId): int;

    /**
     * Conta quantos produtos um usuário possui.
     */
    public function countByUsuario(int $usuarioId): int;

    /**
     * Retorna todos os produtos de um usuário (sem paginação).
     *
     * @return Collection|array
     */
    public function getByUsuario(int $usuarioId): mixed;

    public function findForUsuario(int $id): Produto;

    public function countParcelasByProdutoId(int $produtoId): int;

    public function countVendaItensByProdutoId(int $produtoId): int;

    /**
     * Produtos do usuário autenticado entre os ids informados, indexados por id.
     *
     * @param  list<int>  $ids
     * @return EloquentCollection<int, Produto>
     */
    public function findManyDoUsuario(array $ids): EloquentCollection;

    /**
     * Produtos ativos do usuário autenticado para adicionar numa venda.
     *
     * @return EloquentCollection<int, Produto>
     */
    public function autocompleteParaVenda(?string $q = null): EloquentCollection;

    public function indexFiltrado(ProdutoSearchDTO $filters): LengthAwarePaginator;

    /**
     * Produtos ativos do usuário, com grupo, ordenados por nome.
     *
     * @return Collection<int, Produto>
     */
    public function ativosDoUsuario(int $usuarioId): Collection;

    public function atualizarFoto(int $id, ?string $fotoPath): Produto;

    /**
     * Produtos ativos do usuário sem preço de venda ou vendidos abaixo do custo.
     *
     * @return Collection<int, Produto>
     */
    public function ativosComPrecoDeVendaSuspeito(int $usuarioId): Collection;

    /**
     * Grava o arquivo da foto no disco de produtos e retorna o caminho.
     */
    public function salvarArquivoFoto(UploadedFile $foto, int $usuarioId): string;

    public function apagarArquivoFoto(string $fotoPath): void;
}
