<?php

namespace App\Repositories\Interfaces;

use App\Models\Empresa;

interface EmpresaRepositoryInterface extends AbstractRepositoryInterface
{
    public function findComModulos(int $id): Empresa;

    /**
     * Troca os ajustes de módulo da Empresa pelos informados (módulo => ligado); módulo ausente volta a herdar do Segmento.
     *
     * @param  array<string, bool>  $ajustes
     */
    public function sincronizarAjustes(int $empresaId, array $ajustes): void;
}
