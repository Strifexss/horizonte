<?php

namespace App\Services\Interfaces;

interface UsuariosTransferServiceInterface
{
    /**
     * Quantidade de registros do usuário em cada módulo transferível.
     *
     * @return array{produtos: int, fornecedores: int}
     */
    public function contagens(int $usuarioId): array;

    /**
     * Realiza a duplicação dos dados selecionados de um usuário para outro.
     *
     * @param  array  $payload  // array with keys: origem_id, destino_id, modulos, migrar_relacionamentos
     * @return array summary with counts and skipped items
     */
    public function transfer(array $payload): array;
}
