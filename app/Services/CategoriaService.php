<?php

namespace App\Services;

use App\DTO\CategoriaDTO;
use App\Repositories\Interfaces\CategoriaRepositoryInterface;
use App\Services\Interfaces\CategoriaServiceInterface;

class CategoriaService extends ServiceAbstract implements CategoriaServiceInterface
{
    private const SISTEMA_BLOQUEIO_MSG = 'Categorias do sistema não podem ser alteradas ou excluídas.';

    public function __construct(
        CategoriaRepositoryInterface $categoriaRepository
    ) {
        parent::__construct($categoriaRepository);
    }

    /**
     * @param  CategoriaDTO|array|null  $data
     */
    public function store($data)
    {
        return parent::store($data);
    }

    public function index($data = null)
    {
        return parent::index($data);
    }

    public function update($id, $data)
    {
        $categoria = $this->repository->find((int) $id);
        $this->assertNaoEhCategoriaDoSistema($categoria);

        return parent::update($id, $data);
    }

    /**
     * Autocomplete de categorias delegando para o repositório.
     *
     * @param  string|null  $q
     * @return mixed
     */
    public function autocomplete($q = null, ?string $tipo = null)
    {
        /** @var CategoriaRepositoryInterface $repo */
        $repo = $this->repository;

        return $repo->autocomplete($q, $tipo);
    }

    /**
     * @param  int  $id
     */
    public function delete($id)
    {
        $categoria = $this->repository->find((int) $id);
        $this->assertNaoEhCategoriaDoSistema($categoria);

        return parent::delete($categoria);
    }

    private function assertNaoEhCategoriaDoSistema(mixed $categoria): void
    {
        if ((int) $categoria->padrao === 1 || $categoria->usuario_id === null) {
            throw new \Exception(self::SISTEMA_BLOQUEIO_MSG);
        }
    }
}
