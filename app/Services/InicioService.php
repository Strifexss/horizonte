<?php

namespace App\Services;

use App\Models\Empresa;
use App\Modulos;
use App\Repositories\Interfaces\FinanceiroRepositoryInterface;
use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use App\Repositories\Interfaces\TvDispositivoRepositoryInterface;
use App\Repositories\Interfaces\VendaRepositoryInterface;
use App\Services\Interfaces\EmpresasServiceInterface;
use App\Services\Interfaces\InicioServiceInterface;
use Illuminate\Support\Collection;

class InicioService extends ServiceAbstract implements InicioServiceInterface
{
    private const LIMITE_ULTIMOS_LANCAMENTOS = 6;

    public function __construct(
        private FinanceiroRepositoryInterface $financeiroRepository,
        private ProdutoRepositoryInterface $produtoRepository,
        private VendaRepositoryInterface $vendaRepository,
        private TvDispositivoRepositoryInterface $tvDispositivoRepository,
        private EmpresasServiceInterface $empresasService,
    ) {
        parent::__construct($financeiroRepository);
    }

    public function primeirosPassos(): array
    {
        $empresaId = (int) Empresa::atualId();

        $passos = [
            ['chave' => 'produto', 'feito' => $this->produtoRepository->existeNaEmpresa($empresaId)],
            ['chave' => 'despesa', 'feito' => $this->financeiroRepository->existeDespesaNaEmpresa($empresaId)],
            ['chave' => 'venda', 'feito' => $this->vendaRepository->existeNaEmpresa($empresaId)],
        ];

        if ($this->empresasService->podeUsar(Modulos::MENU_BOARD)) {
            $passos[] = ['chave' => 'tv', 'feito' => $this->tvDispositivoRepository->ativosDaEmpresa($empresaId)->isNotEmpty()];
        }

        return $passos;
    }

    public function resumo(): array
    {
        $empresaId = (int) Empresa::atualId();
        $hoje = now()->toDateString();

        return [
            'hoje' => $this->totais($empresaId, $hoje, $hoje),
            'mes' => $this->totais($empresaId, now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()),
        ];
    }

    public function ultimosLancamentos(): Collection
    {
        return $this->financeiroRepository->ultimasParcelas((int) Empresa::atualId(), self::LIMITE_ULTIMOS_LANCAMENTOS);
    }

    /**
     * @return array{receitas: float, despesas: float, saldo: float}
     */
    private function totais(int $empresaId, string $dataInicio, string $dataFim): array
    {
        $totais = $this->financeiroRepository->totaisNoPeriodo($empresaId, $dataInicio, $dataFim);

        return [
            'receitas' => $totais['receitas'],
            'despesas' => $totais['despesas'],
            'saldo' => round($totais['receitas'] - $totais['despesas'], 2),
        ];
    }
}
