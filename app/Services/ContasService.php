<?php

namespace App\Services;

use App\DTO\ContaDTO;
use App\Repositories\Interfaces\ContaRepositoryInterface;
use App\Services\Interfaces\ContasServiceInterface;
use Illuminate\Support\Facades\Auth;
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
                $usuarioId = (int) ($data->usuario_id ?? Auth::id());
                $this->contaRepository->clearPadraoForUsuario($usuarioId);
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
                $usuarioId = (int) ($data->usuario_id ?? Auth::id());
                $this->contaRepository->clearPadraoForUsuario($usuarioId, (int) $id);
            }

            return parent::update($id, $data);
        });
    }

    public function index($data = null)
    {
        return parent::index($data);
    }
}
