<?php

use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();

    config([
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);
});

function lancarParcelaNoDashboard(
    User $user,
    string $tipo,
    string $competencia,
    float $valor,
    float $valorPago = 0,
    ?string $vencimento = null,
    ?Conta $conta = null,
): FinanceiroParcela {
    $conta ??= Conta::query()->create([
        'nome' => 'Carteira '.$user->id,
        'usuario_id' => $user->id,
    ]);

    $categoria = Categoria::query()->create([
        'nome' => $tipo.' '.$competencia,
        'tipo' => strtolower($tipo),
        'usuario_id' => $user->id,
    ]);

    $financeiro = Financeiro::query()->create([
        'descricao' => $tipo.' '.$competencia,
        'valor' => $valor,
        'tipo' => $tipo,
        'usuario_id' => $user->id,
    ]);

    return FinanceiroParcela::query()->create([
        'descricao' => $tipo.' '.$competencia,
        'data_vencimento' => $vencimento ?? $competencia,
        'data_competencia' => $competencia,
        'valor' => $valor,
        'valor_pago' => $valorPago,
        'parcela' => 1,
        'financeiro_id' => $financeiro->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'usuario_id' => $user->id,
    ]);
}

it('redirects guests to the login page', function (): void {
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

it('shows twelve zero balances when the year has no parcels', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('ano', 2026)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('saldos', 12)
                ->where('saldos', function ($saldos): bool {
                    expect($saldos)->toHaveCount(12);

                    foreach ($saldos as $indice => $linha) {
                        expect($linha['mes'])->toBe($indice + 1)
                            ->and($linha['saldo'])->toBe(0);
                    }

                    return true;
                })
            )
        );

    $this->travelBack();
});

it('shows the monthly net of face value by competencia for the signed-in user', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    $outraPessoa = User::factory()->create();
    $contaCorrente = Conta::query()->create([
        'nome' => 'Corrente',
        'usuario_id' => $user->id,
    ]);
    $contaPoupanca = Conta::query()->create([
        'nome' => 'Poupança',
        'usuario_id' => $user->id,
    ]);

    lancarParcelaNoDashboard($user, 'RECEITA', '2026-01-10', 200, 0, '2026-02-01', $contaCorrente);
    lancarParcelaNoDashboard($user, 'DESPESA', '2026-01-20', 50, 20, '2026-01-20', $contaPoupanca);
    lancarParcelaNoDashboard($user, 'DESPESA', '2026-01-25', 30, 30, '2026-01-25', $contaCorrente);
    lancarParcelaNoDashboard($user, 'RECEITA', '2026-03-02', 15, 0, '2026-04-01', $contaCorrente);
    lancarParcelaNoDashboard($user, 'RECEITA', '2025-12-01', 999, 999, '2025-12-01', $contaCorrente);
    lancarParcelaNoDashboard($outraPessoa, 'RECEITA', '2026-01-01', 500, 500);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('ano', 2026)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('saldos', 12)
                ->where('saldos.0.mes', 1)
                ->where('saldos.0.rotulo', 'Jan')
                ->where('saldos.0.saldo', 120)
                ->where('saldos.1.rotulo', 'Fev')
                ->where('saldos.1.saldo', 0)
                ->where('saldos.2.rotulo', 'Mar')
                ->where('saldos.2.saldo', 15)
                ->where('saldos.11.rotulo', 'Dez')
                ->where('saldos.11.saldo', 0)
            )
        );

    $this->travelBack();
});
