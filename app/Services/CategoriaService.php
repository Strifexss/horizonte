<?php

namespace App\Services;

use App\DTO\CategoriaDTO;
use App\Repositories\Interfaces\CategoriaRepositoryInterface;
use App\Services\Interfaces\CategoriaServiceInterface;

class CategoriaService extends ServiceAbstract implements CategoriaServiceInterface
{
    public function __construct(
        CategoriaRepositoryInterface $categoriaRepository
    ) {
        parent::__construct($categoriaRepository);
    }

    /**
     * @param CategoriaDTO|array|null $data
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
        return parent::update($id, $data);
    }

    /**
     * @param int $id
     */
    public function delete($id)
    {
        $categoria = $this->repository->find($id);

        if (!$categoria) {
            throw new \Exception('Categoria não encontrada.');
        }

        if ((int) $categoria->padrao === 1) {
            throw new \Exception('Categorias padrão não podem ser excluídas.');
        }

        return parent::delete($categoria);
    }
}

