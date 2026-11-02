<?php

namespace App\Repositories\Interfaces;

use App\DTO\ProdutoSearchDTO;
use App\Models\Produto;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Pagination\Paginator;
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
    public function countByEmpresa(int $empresaId): int;

    /**
     * Retorna todos os produtos de um usuário (sem paginação).
     *
     * @return Collection|array
     */
    public function getByEmpresa(int $empresaId): mixed;

    public function findDaEmpresa(int $id): Produto;

    public function countParcelasByProdutoId(int $produtoId): int;

    public function countVendaItensByProdutoId(int $produtoId): int;

    /**
     * Produtos do usuário autenticado entre os ids informados, indexados por id.
     *
     * @param  list<int>  $ids
     * @return EloquentCollection<int, Produto>
     */
    public function findManyDaEmpresa(array $ids): EloquentCollection;

    /**
     * Produtos ativos do usuário autenticado para adicionar numa venda.
     *
     * @return EloquentCollection<int, Produto>
     */
    public function autocompleteParaVenda(?string $q = null): EloquentCollection;

    /**
     * Página do catálogo da venda no celular: busca por nome ou código tem prioridade
     * sobre a aba (favoritos ou grupo); sem busca nem aba, todos os ativos.
     */
    public function catalogoParaVenda(?string $q, ?int $grupoId, bool $soFavoritos, int $page): Paginator;

    /**
     * Produtos ativos marcados como favoritos, atalhos da Nova Venda.
     *
     * @return EloquentCollection<int, Produto>
     */
    public function favoritosParaVenda(): EloquentCollection;

    public function atualizarPrecoDeVenda(int $id, float $precoVenda): void;

    public function marcarFavorito(int $id, bool $favorito): Produto;

    public function indexFiltrado(ProdutoSearchDTO $filters): LengthAwarePaginator;

    /**
     * Produtos ativos do usuário, com grupo, ordenados por nome.
     *
     * @return Collection<int, Produto>
     */
    public function ativosDaEmpresa(int $empresaId): Collection;

    /**
     * Se a Empresa já cadastrou algum produto.
     */
    public function existeNaEmpresa(int $empresaId): bool;

    public function atualizarFoto(int $id, ?string $fotoPath): Produto;

    /**
     * Produtos ativos do usuário sem preço de venda ou vendidos abaixo do custo.
     *
     * @return Collection<int, Produto>
     */
    public function ativosComPrecoDeVendaSuspeito(int $empresaId): Collection;

    /**
     * Grava o arquivo da foto no disco de produtos e retorna o caminho.
     */
    public function salvarArquivoFoto(UploadedFile $foto, int $empresaId): string;

    public function apagarArquivoFoto(string $fotoPath): void;
}
