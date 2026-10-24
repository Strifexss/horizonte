<?php

namespace App\Repositories\Interfaces;

use App\Models\Novidade;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

interface NovidadeRepositoryInterface extends AbstractRepositoryInterface
{
    /**
     * Novidade publicada; 404 para rascunho ou inexistente.
     */
    public function findPublicada(int $id): Novidade;

    /**
     * Publicadas com pop-up automático que o usuário ainda não dispensou, da mais antiga para a mais nova.
     *
     * @return Collection<int, Novidade>
     */
    public function pendentesPopup(int $usuarioId): Collection;

    /**
     * Todas as publicadas, da mais nova para a mais antiga, com o atributo `dispensada` do usuário.
     *
     * @return Collection<int, Novidade>
     */
    public function historicoDoUsuario(int $usuarioId): Collection;

    /**
     * Registra que o usuário dispensou a novidade; repetir não cria outro registro.
     */
    public function dispensar(int $usuarioId, int $novidadeId): void;

    /**
     * Faz a novidade voltar a abrir sozinha para o usuário.
     */
    public function desfazerDispensa(int $usuarioId, int $novidadeId): void;

    /**
     * Apaga a dispensa de todos os usuários da novidade.
     */
    public function limparDispensas(int $novidadeId): void;

    /**
     * Todos os usuários em ordem de nome, com `dispensada_em` preenchido para quem dispensou a novidade.
     *
     * @return Collection<int, User>
     */
    public function usuariosComDispensa(int $novidadeId): Collection;

    /**
     * Grava a imagem na pasta de novidades do disco público e devolve o caminho relativo.
     */
    public function salvarImagem(UploadedFile $imagem): string;

    public function apagarImagem(string $caminho): void;

    /**
     * Vincula as imagens já gravadas ao fim da lista da novidade.
     *
     * @param  list<string>  $caminhos
     */
    public function adicionarImagens(int $novidadeId, array $caminhos): void;

    /**
     * Desvincula só as imagens que pertencem à novidade e devolve os caminhos delas.
     *
     * @param  list<int>  $ids
     * @return list<string>
     */
    public function removerImagens(int $novidadeId, array $ids): array;

    /**
     * @return list<string>
     */
    public function caminhosDasImagens(int $novidadeId): array;

    /**
     * Arquivos da pasta de imagens, do mais novo para o mais antigo, com a novidade dona quando houver.
     *
     * @return Collection<int, array{arquivo: string, url: string, tamanho: int, modificado_em: Carbon, novidade_id: ?int, novidade_titulo: ?string}>
     */
    public function diretorioImagens(): Collection;

    /**
     * Apaga o arquivo da pasta e o vínculo com a novidade; 404 se o arquivo não existe.
     */
    public function excluirDoDiretorio(string $arquivo): void;
}
