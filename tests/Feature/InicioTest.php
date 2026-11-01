<?php

use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\Produto;
use App\Models\TvDispositivo;
use App\Models\User;
use App\Models\Venda;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();

    config([
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);
});

function lancarNoInicio(User $user, string $tipo, string $competencia, float $valor, string $descricao = 'Lançamento'): FinanceiroParcela
{
    $conta = Conta::query()->firstOrCreate(['nome' => 'Carteira '.$user->id, 'usuario_id' => $user->id]);
    $categoria = Categoria::query()->firstOrCreate(['nome' => $tipo.' '.$user->id, 'tipo' => strtolower($tipo), 'usuario_id' => $user->id]);

    $financeiro = Financeiro::query()->create([
        'forma_pagamento_id' => formaPagamentoEspecieId(),
        'descricao' => $descricao,
        'valor' => $valor,
        'tipo' => $tipo,
        'usuario_id' => $user->id,
    ]);

    return FinanceiroParcela::query()->create([
        'descricao' => $descricao,
        'data_vencimento' => $competencia,
        'data_competencia' => $competencia,
        'valor' => $valor,
        'valor_pago' => 0,
        'parcela' => 1,
        'financeiro_id' => $financeiro->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'usuario_id' => $user->id,
    ]);
}

function registrarVendaNoInicio(User $user): Venda
{
    return Venda::query()->create([
        'status' => Venda::STATUS_ABERTA,
        'total' => 10,
        'data_venda' => now(),
        'usuario_id' => $user->id,
    ]);
}

/**
 * @return array<string, bool>
 */
function passosNoInicio(User $user): array
{
    $response = test()->actingAs($user)->get(route('inicio'));

    $response->assertInertia(fn (Assert $page) => $page->component('inicio/index'));

    return collect($response->viewData('page')['props']['primeirosPassos'])->pluck('feito', 'chave')->all();
}

it('mostra os primeiros passos pendentes para uma empresa nova', function (): void {
    expect(passosNoInicio(User::factory()->create()))->toBe([
        'produto' => false,
        'despesa' => false,
        'venda' => false,
    ]);
});

it('marca cada passo pelo que a empresa ja tem', function (): void {
    $user = User::factory()->create();

    lancarNoInicio($user, 'RECEITA', now()->toDateString(), 50);

    expect(passosNoInicio($user))->toBe(['produto' => false, 'despesa' => false, 'venda' => false]);

    Produto::query()->create(['nome' => 'X-Burger', 'preco_compra' => 8, 'usuario_id' => $user->id]);
    lancarNoInicio($user, 'DESPESA', now()->toDateString(), 30);
    registrarVendaNoInicio($user);

    expect(passosNoInicio($user))->toBe(['produto' => true, 'despesa' => true, 'venda' => true]);
});

it('inclui o passo da TV so para a empresa que pode usar o Menu Board', function (): void {
    $restaurante = User::factory()->restaurante()->create();

    expect(passosNoInicio($restaurante))->toHaveKey('tv', false);

    TvDispositivo::query()->create(['usuario_id' => $restaurante->id, 'token_hash' => hash('sha256', 'token-da-tv')]);

    expect(passosNoInicio($restaurante))->toHaveKey('tv', true)
        ->and(passosNoInicio(User::factory()->create()))->not->toHaveKey('tv');
});

it('nao conta os dados de outra empresa nos primeiros passos', function (): void {
    $outraPessoa = User::factory()->create();

    Produto::query()->create(['nome' => 'X-Burger', 'preco_compra' => 8, 'usuario_id' => $outraPessoa->id]);
    lancarNoInicio($outraPessoa, 'DESPESA', now()->toDateString(), 30);
    registrarVendaNoInicio($outraPessoa);

    expect(passosNoInicio(User::factory()->create()))->toBe(['produto' => false, 'despesa' => false, 'venda' => false]);
});

it('resume receitas, despesas e saldo de hoje e do mes pela competencia', function (): void {
    $this->travelTo('2026-11-14 10:00:00');

    $user = User::factory()->create();

    lancarNoInicio($user, 'RECEITA', '2026-11-14', 100);
    lancarNoInicio($user, 'DESPESA', '2026-11-14', 130);
    lancarNoInicio($user, 'RECEITA', '2026-11-03', 50);
    lancarNoInicio($user, 'RECEITA', '2026-10-31', 999);
    lancarNoInicio(User::factory()->create(), 'RECEITA', '2026-11-14', 500);

    $this->actingAs($user)
        ->get(route('inicio'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('inicio/index')
            ->loadDeferredProps('resumo', fn (Assert $reload) => $reload
                ->where('resumo.hoje', ['receitas' => 100, 'despesas' => 130, 'saldo' => -30])
                ->where('resumo.mes', ['receitas' => 150, 'despesas' => 130, 'saldo' => 20])
            )
        );

    $this->travelBack();
});

it('lista os seis ultimos lancamentos da empresa, do mais recente para o mais antigo', function (): void {
    $user = User::factory()->create();

    foreach (range(1, 7) as $numero) {
        lancarNoInicio($user, 'RECEITA', now()->toDateString(), $numero, 'Lançamento '.$numero);
    }

    lancarNoInicio(User::factory()->create(), 'RECEITA', now()->toDateString(), 500, 'De outra empresa');

    $this->actingAs($user)
        ->get(route('inicio'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('inicio/index')
            ->loadDeferredProps('ultimosLancamentos', fn (Assert $reload) => $reload
                ->has('ultimosLancamentos', 6)
                ->where('ultimosLancamentos.0.descricao', 'Lançamento 7')
                ->where('ultimosLancamentos.5.descricao', 'Lançamento 2')
            )
        );
});
