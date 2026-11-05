<?php

namespace App\Repositories;

use App\Models\Configuracao;
use App\Repositories\Interfaces\ConfiguracaoRepositoryInterface;

class ConfiguracaoRepository extends AbstractRepository implements ConfiguracaoRepositoryInterface
{
    public function __construct(Configuracao $configuracao)
    {
        parent::__construct($configuracao);
    }

    public function valor(string $chave): ?string
    {
        $valor = $this->model->newQuery()->where('chave', $chave)->value('valor');

        return $valor === null ? null : (string) $valor;
    }

    public function definir(string $chave, ?string $valor): void
    {
        $this->model->newQuery()->updateOrCreate(['chave' => $chave], ['valor' => $valor]);
    }

    public function autocomplete($q = null)
    {
        return collect();
    }
}
