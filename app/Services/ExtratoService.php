<?php

namespace App\Services;

use App\DTO\FinanceiroDTO;
use App\DTO\FinanceiroParcelaDTO;
use App\DTO\FinanceiroSearchDTO;
use App\Models\FinanceiroParcela;
use App\Repositories\Interfaces\FinanceiroRepositoryInterface;
use App\Services\Interfaces\ExtratoServiceInterface;
use Illuminate\Support\Collection;
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

    public function resumo($data = null): array
    {
        /** @var FinanceiroRepositoryInterface $repo */
        $repo = $this->repository;

        return $repo->resumoParcelas($data instanceof FinanceiroSearchDTO ? $data : null);
    }

    public function show(int $id)
    {
        return $this->repository->find($id);
    }

    /**
     * Retorna todas as parcelas (sem paginação) para exportação/pdf.
     *
     * @return Collection<int, FinanceiroParcela>
     */
    public function export($data = null)
    {
        return $this->repository->exportParcelas($data instanceof FinanceiroSearchDTO ? $data : null);
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
            'data_competencia' => $financeiroDto->data_competencia,
            'categoria_id' => $financeiroDto->categoria_id,
            'produto_id' => $financeiroDto->produto_id,
            'fornecedor_id' => $financeiroDto->fornecedor_id,
            'funcionario_id' => $financeiroDto->funcionario_id,
            'conta_id' => $financeiroDto->conta_id,
            'quantidade' => $financeiroDto->quantidade ?? 1,
            'valor' => $financeiroDto->valor,
            'valor_pago' => $financeiroDto->valor_pago,
            'parcela' => 1,
        ]);

        return $this->repository->storeParcela($parcelaDto);
    }
}
