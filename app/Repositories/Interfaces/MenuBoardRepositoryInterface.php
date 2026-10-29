<?php

namespace App\Repositories\Interfaces;

use App\Models\MenuBoard;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

interface MenuBoardRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Boards do usuário com a contagem de páginas, o tempo do ciclo e o resumo de cada página.
     *
     * @return Collection<int, MenuBoard>
     */
    public function indexComContagens(int $usuarioId): Collection;

    /**
     * Garante que o board pertence ao usuário informado.
     */
    public function findForUsuario(int $id, int $usuarioId): MenuBoard;

    /**
     * Board do usuário com as páginas e os itens de produtos ativos carregados.
     */
    public function findComPaginas(int $id, int $usuarioId): MenuBoard;

    /**
     * Substitui as páginas do board pela lista informada, na ordem recebida.
     *
     * @param  list<array{nome: string, layout: string, duracao_segundos: int, configuracao: array<string, mixed>, imagem_path: ?string, itens: list<array{produto_id: int, destaque: bool}>}>  $paginas
     */
    public function sincronizarPaginas(int $menuBoardId, array $paginas): void;

    /**
     * Caminhos das imagens usadas pelas páginas do board.
     *
     * @return list<string>
     */
    public function imagensDoBoard(int $menuBoardId): array;

    public function salvarArquivoImagem(UploadedFile $imagem, int $usuarioId): string;

    public function apagarArquivoImagem(string $imagemPath): void;

    /**
     * Trava os boards do usuário até o fim da transação corrente.
     */
    public function travarDoUsuario(int $usuarioId): void;

    /**
     * Desmarca o board ativo do usuário.
     */
    public function desativarDoUsuario(int $usuarioId): int;

    public function marcarAtivo(int $id): void;

    /**
     * Board ativo do usuário pronto para a TV: itens de produtos ativos e, nas páginas por grupo,
     * os produtos ativos do grupo.
     */
    public function findAtivoDoUsuario(int $usuarioId): ?MenuBoard;
}
