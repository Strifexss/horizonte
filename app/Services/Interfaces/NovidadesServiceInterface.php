<?php

namespace App\Services\Interfaces;

use App\Models\Novidade;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

interface NovidadesServiceInterface extends AbstractServiceInterface
{
    /**
     * Troca entre rascunho e publicado; a primeira publicação grava a data de publicação.
     */
    public function alterarStatus(int $id, string $status): Novidade;

    /**
     * @return Collection<int, Novidade>
     */
    public function pendentesPopup(int $usuarioId): Collection;

    /**
     * @return Collection<int, Novidade>
     */
    public function historicoDoUsuario(int $usuarioId): Collection;

    /**
     * Impede que a novidade publicada volte a abrir sozinha para o usuário.
     */
    public function dispensar(int $novidadeId, int $usuarioId): void;

    /**
     * Usuários do sistema com a data em que cada um dispensou a novidade.
     *
     * @return Collection<int, User>
     */
    public function usuariosDaNovidade(int $novidadeId): Collection;

    /**
     * Dispensa a novidade em nome do usuário, pelo painel.
     */
    public function marcarDispensa(int $novidadeId, int $usuarioId): void;

    /**
     * Faz a novidade voltar a abrir sozinha para o usuário.
     */
    public function desmarcarDispensa(int $novidadeId, int $usuarioId): void;

    /**
     * Apaga as dispensas de todos e move a publicação para agora; só para novidade publicada.
     */
    public function relancar(int $id): Novidade;

    /**
     * @return Collection<int, array{arquivo: string, url: string, tamanho: int, modificado_em: Carbon, novidade_id: ?int, novidade_titulo: ?string}>
     */
    public function diretorioImagens(): Collection;

    /**
     * Apaga o arquivo da pasta de imagens e o tira da novidade que o usava.
     */
    public function excluirImagemDoDiretorio(string $arquivo): void;
}
