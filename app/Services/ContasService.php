<?php

namespace App\Services;

use App\DTO\ContaDTO;
use App\Models\Empresa;
use App\Repositories\Interfaces\ContaRepositoryInterface;
use App\Services\Interfaces\ContasServiceInterface;
use Illuminate\Support\Facades\DB;

class ContasService extends ServiceAbstract implements ContasServiceInterface
{
    public function __construct(
        private ContaRepositoryInterface $contaRepository
    ) {
        parent::__construct($contaRepository);
    }

    /**
     * @param  ContaDTO  $data
     */
    public function store($data)
    {
        return DB::transaction(function () use ($data) {
            if ($data instanceof ContaDTO && (int) $data->padrao === 1) {
                $this->contaRepository->clearPadraoDaEmpresa($this->empresaDoAutor($data));
            }

            return parent::store($data);
        });
    }

    /**
     * @param  ContaDTO  $data
     */
    public function update($id, $data)
    {
        return DB::transaction(function () use ($id, $data) {
            if ($data instanceof ContaDTO && (int) $data->padrao === 1) {
                $this->contaRepository->clearPadraoDaEmpresa($this->empresaDoAutor($data), (int) $id);
            }

            return parent::update($id, $data);
        });
    }

    public function index($data = null)
    {
        return parent::index($data);
    }

    private function empresaDoAutor(ContaDTO $data): int
    {
        return (int) ($data->usuario_id !== null ? Empresa::idDoUsuario($data->usuario_id) : Empresa::atualId());
    }
}
