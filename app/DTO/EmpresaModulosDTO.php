<?php

namespace App\DTO;

class EmpresaModulosDTO extends Dto
{
    public int $segmento_id;

    /**
     * Módulo opcional => 'herdar' | 'ligar' | 'desligar'.
     *
     * @var array<string, string>
     */
    public array $ajustes = [];

    /**
     * Só os módulos com ajuste explícito, como módulo => ligado.
     *
     * @return array<string, bool>
     */
    public function ajustesExplicitos(): array
    {
        $explicitos = array_filter($this->ajustes, fn (string $estado) => $estado !== 'herdar');

        return array_map(fn (string $estado) => $estado === 'ligar', $explicitos);
    }
}
