<?php

namespace App\Repositories;

use App\DTO\FinanceiroParcelaDTO;
use App\DTO\FinanceiroSearchDTO;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Repositories\Interfaces\FinanceiroRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class FinanceiroRepository extends AbstractRepository implements FinanceiroRepositoryInterface
{
    public function __construct(Financeiro $financeiro)
    {
        parent::__construct($financeiro);
    }

    public function index($data = null)
    {
        return $this->model->newQuery()
            ->where('usuario_id', Auth::id())
            ->with('categoria')
            ->orderBy('data_criacao', 'desc')
            ->get();
    }

    public function indexParcelas(?FinanceiroSearchDTO $data = null)
    {
        $query = FinanceiroParcela::query()
            ->with([
                'financeiro' => function ($query) {
                    $query->select('id', 'tipo', 'categoria_id', 'conta_id')
                        ->with([
                            'categoria' => function ($q) {
                                $q->select('id', 'nome');
                            },
                            'conta' => function ($q) {
                                $q->select('id', 'nome');
                            },
                        ]);
                },
            ])
            ->where('usuario_id', Auth::id());

        if ($data instanceof FinanceiroSearchDTO) {
            $coluna = $data->tipo_data === 'competencia' ? 'data_competencia' : 'data_vencimento';

            if ($data->data_inicio !== null) {
                $query->whereDate($coluna, '>=', $data->data_inicio);
            }

            if ($data->data_fim !== null) {
                $query->whereDate($coluna, '<=', $data->data_fim);
            }

            if ($data->conta_id !== null) {
                $query->whereHas('financeiro', function ($q) use ($data) {
                    $q->where('conta_id', $data->conta_id);
                });
            }

            if ($data->categoria_id !== null) {
                $query->whereHas('financeiro', function ($q) use ($data) {
                    $q->where('categoria_id', $data->categoria_id);
                });
            }

            if ($data->status === 'aberto') {
                $query->where(function ($q) {
                    $q->whereNull('valor_pago')->orWhere('valor_pago', 0);
                });
            } elseif ($data->status === 'pago') {
                $query->whereColumn('valor_pago', '>=', 'valor');
            } elseif ($data->status === 'parcial') {
                $query->where('valor_pago', '>', 0)
                    ->whereColumn('valor_pago', '<', 'valor');
            }
        }

        return $query->orderBy('data_vencimento', 'desc')->get();
    }

    public function storeParcela(FinanceiroParcelaDTO $dto)
    {
        return FinanceiroParcela::create($dto->all());
    }
}
