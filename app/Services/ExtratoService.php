<?php

namespace App\Services;

use App\DTO\FinanceiroDTO;
use App\DTO\FinanceiroParcelaDTO;
use App\DTO\FinanceiroSearchDTO;
use App\Repositories\Interfaces\FinanceiroRepositoryInterface;
use App\Services\Interfaces\ExtratoServiceInterface;
use Illuminate\Support\Facades\DB;

class ExtratoService extends ServiceAbstract implements ExtratoServiceInterface
{
    /**
     * @property FinanceiroRepositoryInterface $repository
     */
    public function __construct(
        FinanceiroRepositoryInterface $repository
    ) {
        parent::__construct($repository);
    }

    public function index($data = null)
    {
        return $this->repository->indexParcelas($data instanceof FinanceiroSearchDTO ? $data : null);
    }

    public function show(int $id)
    {
        return $this->repository->find($id);
    }

    /**
     * @param  FinanceiroDTO  $dto
     */
    public function store($financeiroDto)
    {
        DB::transaction(function () use ($financeiroDto) {
            $financeiro = parent::store($financeiroDto);
            $financeiroDto->id = $financeiro->id;

            $this->storeParcelas($financeiroDto);

            return $financeiro;
        });
    }

    public function storeParcelas(FinanceiroDTO $financeiroDto)
    {
        $parcelaDto = FinanceiroParcelaDTO::fromArray([
            'financeiro_id' => $financeiroDto->id,
            'usuario_id' => $financeiroDto->usuario_id,
            'descricao' => $financeiroDto->descricao,
            'data_vencimento' => $financeiroDto->data_vencimento,
            'data_competencia' => now(),
            'categoria_id' => $financeiroDto->categoria_id,
            'produto_id' => $financeiroDto->produto_id,
            'funcionario_id' => $financeiroDto->funcionario_id,
            'conta_id' => $financeiroDto->conta_id,
            'valor' => $financeiroDto->valor,
            'valor_pago' => $financeiroDto->valor_pago,
            'parcela' => 1,
        ]);

        return $this->repository->storeParcela($parcelaDto);
    }
}
