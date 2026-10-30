<?php

namespace App\Services\Interfaces;

use App\Models\Empresa;
use App\Models\User;

interface EmpresasServiceInterface
{
    /**
     * Cria a Empresa no onboarding, já com o nome confirmado, e vincula o usuário como admin master.
     */
    public function criarNoOnboarding(User $usuario, string $nome, string $modulo): Empresa;

    /**
     * Grava o nome oficial da Empresa e o marca como confirmado.
     */
    public function confirmarNome(Empresa $empresa, string $nome): Empresa;
}
