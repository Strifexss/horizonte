<?php

namespace App\Services\Interfaces;

use App\DTO\UsuarioDTO;
use App\Models\User;

interface UsuariosServiceInterface extends AbstractServiceInterface
{
    /**
     * Indica se o e-mail está na lista de Administradores do ambiente.
     */
    public function isAdministrador(?string $email): bool;

    /**
     * Atualiza o usuário; trocar a senha encerra as sessões dele, exceto a sessão atual.
     *
     * @param  UsuarioDTO  $data
     */
    public function update($id, $data, ?string $sessaoAtualId = null);

    /**
     * Retorna o usuário alvo do "Entrar como"; Administradores não podem ser alvo.
     *
     * @throws \DomainException
     */
    public function entrarComo(int $id): User;
}
