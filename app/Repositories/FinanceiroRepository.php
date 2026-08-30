<?php

namespace App\Repositories;

use App\DTO\FinanceiroParcelaDTO;
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
    
    public function indexParcelas($data = null)
    {
        $query = FinanceiroParcela::query()
            ->with([
                'financeiro' => function ($query) {
                    $query->select('id', 'tipo', 'categoria_id')
                        ->with(['categoria' => function ($q) {
                            $q->select('id', 'nome');
                        }]);
                },
            ])
            ->where('usuario_id', Auth::id())
            ->orderBy('data_vencimento', 'desc')
            ->get();

        return $query;
    }

    public function storeParcela(FinanceiroParcelaDTO $dto)
    {
        return FinanceiroParcela::create($dto->all());
    }
}

