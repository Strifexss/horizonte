<?php

namespace App\Services\Interfaces;

use App\Models\Novidade;
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
     * @return Collection<int, array{arquivo: string, url: string, tamanho: int, modificado_em: Carbon, novidade_id: ?int, novidade_titulo: ?string}>
     */
    public function diretorioImagens(): Collection;

    /**
     * Apaga o arquivo da pasta de imagens e o tira da novidade que o usava.
     */
    public function excluirImagemDoDiretorio(string $arquivo): void;
}
