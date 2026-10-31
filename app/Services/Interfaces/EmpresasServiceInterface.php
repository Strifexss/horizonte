<?php

namespace App\Services\Interfaces;

use App\DTO\EmpresaModulosDTO;
use App\Models\Empresa;
use App\Models\User;

interface EmpresasServiceInterface extends AbstractServiceInterface
{
    /**
     * Cria a Empresa no onboarding, já com o nome confirmado, e vincula o usuário como admin master.
     */
    public function criarNoOnboarding(User $usuario, string $nome, int $segmentoId): Empresa;

    /**
     * Cria a Empresa de uma conta feita pelo Administrador: Varejo, com o nome ainda a confirmar.
     */
    public function criarParaUsuario(User $usuario): Empresa;

    /**
     * Grava o nome oficial da Empresa e o marca como confirmado.
     */
    public function confirmarNome(Empresa $empresa, string $nome): Empresa;

    public function findComModulos(int $id): Empresa;

    /**
     * Troca o Segmento da Empresa e os ajustes de módulo feitos pelo Administrador.
     */
    public function atualizarModulos(int $id, EmpresaModulosDTO $dados): Empresa;
}
