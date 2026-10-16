<?php

use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\Fornecedor;
use App\Models\Grupo;
use App\Models\Produto;
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

function lancarDespesaComCategoriaNoDashboard(
    User $user,
    string $competencia,
    Categoria $categoria,
    float $valor,
    float $valorPago = 0,
    ?Conta $conta = null,
): FinanceiroParcela {
    $conta ??= Conta::query()->create([
        'nome' => 'Carteira '.$user->id,
        'usuario_id' => $user->id,
    ]);

    $financeiro = Financeiro::query()->create([
        'descricao' => 'DESPESA '.$competencia,
        'valor' => $valor,
        'tipo' => 'DESPESA',
        'usuario_id' => $user->id,
    ]);

    return FinanceiroParcela::query()->create([
        'descricao' => 'DESPESA '.$competencia,
        'data_vencimento' => $competencia,
        'data_competencia' => $competencia,
        'valor' => $valor,
        'valor_pago' => $valorPago,
        'parcela' => 1,
        'financeiro_id' => $financeiro->id,
        'categoria_id' => $categoria->id,
        'conta_id' => $conta->id,
        'usuario_id' => $user->id,
    ]);
}

function lancarDespesaComProdutoNoDashboard(
    User $user,
    string $competencia,
    Produto $produto,
    float $valor,
    ?Conta $conta = null,
    ?Categoria $categoria = null,
): FinanceiroParcela {
    $conta ??= Conta::query()->create([
        'nome' => 'Carteira '.$user->id,
        'usuario_id' => $user->id,
    ]);

    $categoria ??= Categoria::query()->create([
        'nome' => 'Despesa produto '.$competencia,
        'tipo' => 'despesa',
        'usuario_id' => $user->id,
    ]);

    $financeiro = Financeiro::query()->create([
        'descricao' => 'DESPESA produto '.$competencia,
        'valor' => $valor,
        'tipo' => 'DESPESA',
        'usuario_id' => $user->id,
    ]);

    return FinanceiroParcela::query()->create([
        'descricao' => 'DESPESA produto '.$competencia,
        'data_vencimento' => $competencia,
        'data_competencia' => $competencia,
        'valor' => $valor,
        'valor_pago' => 0,
        'parcela' => 1,
        'financeiro_id' => $financeiro->id,
        'categoria_id' => $categoria->id,
        'produto_id' => $produto->id,
        'conta_id' => $conta->id,
        'usuario_id' => $user->id,
    ]);
}

it('shows the same current-month extract totals as the extract page and omits other users', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    $outraPessoa = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Corrente',
        'usuario_id' => $user->id,
    ]);

    lancarParcelaNoDashboard($user, 'RECEITA', '2026-06-10', 150, 0, '2026-06-10', $conta);
    lancarParcelaNoDashboard($user, 'DESPESA', '2026-06-20', 40, 10, '2026-06-20', $conta);
    lancarParcelaNoDashboard($user, 'RECEITA', '2026-05-10', 999, 0, '2026-05-10', $conta);
    lancarParcelaNoDashboard($outraPessoa, 'RECEITA', '2026-06-10', 500, 0);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('resumo.total_credits', function ($valor): bool {
                    expect((float) $valor)->toBe(150.0);

                    return true;
                })
                ->where('resumo.total_debits', function ($valor): bool {
                    expect((float) $valor)->toBe(40.0);

                    return true;
                })
            )
        );

    $this->actingAs($user)
        ->get(route('extrato.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('extrato/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('resumo.total_credits', function ($valor): bool {
                    expect((float) $valor)->toBe(150.0);

                    return true;
                })
                ->where('resumo.total_debits', function ($valor): bool {
                    expect((float) $valor)->toBe(40.0);

                    return true;
                })
            )
        );

    $this->travelBack();
});

it('shows extract kpis for the month of the reference period', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Corrente',
        'usuario_id' => $user->id,
    ]);

    lancarParcelaNoDashboard($user, 'RECEITA', '2026-06-10', 80, 0, '2026-06-10', $conta);
    lancarParcelaNoDashboard($user, 'DESPESA', '2026-06-12', 20, 0, '2026-06-12', $conta);
    lancarParcelaNoDashboard($user, 'RECEITA', '2026-01-10', 300, 0, '2026-01-10', $conta);
    lancarParcelaNoDashboard($user, 'DESPESA', '2026-01-20', 50, 0, '2026-01-20', $conta);

    $this->actingAs($user)
        ->get(route('dashboard', ['ano' => 2026, 'mes' => 1]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('ano', 2026)
            ->where('mes', 1)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('resumo.total_credits', function ($valor): bool {
                    expect((float) $valor)->toBe(300.0);

                    return true;
                })
                ->where('resumo.total_debits', function ($valor): bool {
                    expect((float) $valor)->toBe(50.0);

                    return true;
                })
            )
        );

    $this->travelBack();
});

it('shows zero extract kpis when the current month has no parcels', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    lancarParcelaNoDashboard($user, 'RECEITA', '2026-05-10', 100, 0);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('resumo.total_credits', function ($valor): bool {
                    expect((float) $valor)->toBe(0.0);

                    return true;
                })
                ->where('resumo.total_debits', function ($valor): bool {
                    expect((float) $valor)->toBe(0.0);

                    return true;
                })
            )
        );

    $this->travelBack();
});

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
            ->component('dashboard/index')
            ->where('ano', 2026)
            ->where('mes', 6)
            ->where('anos', [2021, 2022, 2023, 2024, 2025, 2026, 2027])
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('seriesMensais.saldos', 12)
                ->has('seriesMensais.receitas', 12)
                ->has('seriesMensais.despesas', 12)
                ->where('seriesMensais', function ($series): bool {
                    expect($series['saldos'])->toHaveCount(12)
                        ->and($series['receitas'])->toHaveCount(12)
                        ->and($series['despesas'])->toHaveCount(12);

                    foreach ($series['saldos'] as $indice => $linha) {
                        expect($linha['mes'])->toBe($indice + 1)
                            ->and($linha['saldo'])->toBe(0)
                            ->and($series['receitas'][$indice]['valor'])->toBe(0)
                            ->and($series['despesas'][$indice]['valor'])->toBe(0);
                    }

                    return true;
                })
                ->has('despesasPorCategoria', 0)
                ->has('despesasPorGrupoDeProduto', 0)
                ->has('receitasPorDiaDaSemana', 7)
            )
        );

    $this->travelBack();
});

it('shows monthly revenues, expenses and derived balance by competencia for the signed-in user', function (): void {
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
    lancarParcelaNoDashboard($user, 'DESPESA', '2026-04-12', 90, 0, '2026-04-12', $contaCorrente);
    lancarParcelaNoDashboard($user, 'RECEITA', '2025-12-01', 999, 999, '2025-12-01', $contaCorrente);
    lancarParcelaNoDashboard($outraPessoa, 'RECEITA', '2026-01-01', 500, 500);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('ano', 2026)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('seriesMensais.saldos', 12)
                ->has('seriesMensais.receitas', 12)
                ->has('seriesMensais.despesas', 12)
                ->where('seriesMensais.receitas.0.mes', 1)
                ->where('seriesMensais.receitas.0.rotulo', 'Jan')
                ->where('seriesMensais.receitas.0.valor', 200)
                ->where('seriesMensais.despesas.0.valor', 80)
                ->where('seriesMensais.saldos.0.saldo', 120)
                ->where('seriesMensais.receitas.1.rotulo', 'Fev')
                ->where('seriesMensais.receitas.1.valor', 0)
                ->where('seriesMensais.despesas.1.valor', 0)
                ->where('seriesMensais.saldos.1.saldo', 0)
                ->where('seriesMensais.receitas.2.rotulo', 'Mar')
                ->where('seriesMensais.receitas.2.valor', 15)
                ->where('seriesMensais.despesas.2.valor', 0)
                ->where('seriesMensais.saldos.2.saldo', 15)
                ->where('seriesMensais.receitas.3.rotulo', 'Abr')
                ->where('seriesMensais.receitas.3.valor', 0)
                ->where('seriesMensais.despesas.3.valor', 90)
                ->where('seriesMensais.saldos.3.saldo', -90)
                ->where('seriesMensais.saldos.11.rotulo', 'Dez')
                ->where('seriesMensais.saldos.11.saldo', 0)
            )
        );

    $this->travelBack();
});

it('shows expenses by category for the signed-in user using the default month range (competencia)', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira '.$user->id,
        'usuario_id' => $user->id,
    ]);

    $categoriaA = Categoria::query()->create([
        'nome' => 'Categoria A',
        'tipo' => 'despesa',
        'usuario_id' => $user->id,
    ]);

    $categoriaB = Categoria::query()->create([
        'nome' => 'Categoria B',
        'tipo' => 'despesa',
        'usuario_id' => $user->id,
    ]);

    // Dentro do range padrão: 2026-06-01 .. 2026-06-30
    lancarDespesaComCategoriaNoDashboard($user, '2026-06-05', $categoriaA, 10, 0, $conta);
    lancarDespesaComCategoriaNoDashboard($user, '2026-06-20', $categoriaA, 20, 0, $conta);

    // Fora do range padrão (Maio)
    lancarDespesaComCategoriaNoDashboard($user, '2026-05-10', $categoriaB, 999, 0, $conta);

    // Receita não deve entrar, mesmo dentro do range
    $categoriaReceita = Categoria::query()->create([
        'nome' => 'Receita',
        'tipo' => 'receita',
        'usuario_id' => $user->id,
    ]);

    $financeiroReceita = Financeiro::query()->create([
        'descricao' => 'RECEITA 2026-06-10',
        'valor' => 123,
        'tipo' => 'RECEITA',
        'usuario_id' => $user->id,
    ]);

    FinanceiroParcela::query()->create([
        'descricao' => 'RECEITA 2026-06-10',
        'data_vencimento' => '2026-06-10',
        'data_competencia' => '2026-06-10',
        'valor' => 123,
        'valor_pago' => 0,
        'parcela' => 1,
        'financeiro_id' => $financeiroReceita->id,
        'categoria_id' => $categoriaReceita->id,
        'conta_id' => $conta->id,
        'usuario_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('ano', 2026)
            ->where('mes', 6)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('despesasPorCategoria', 1)
                ->where('despesasPorCategoria.0.categoria', 'Categoria A')
                ->where('despesasPorCategoria.0.valor', 30)
            )
        );

    $this->travelBack();
});

it('shows expenses by category for the month of the reference period', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira '.$user->id,
        'usuario_id' => $user->id,
    ]);

    $categoriaA = Categoria::query()->create([
        'nome' => 'Categoria A',
        'tipo' => 'despesa',
        'usuario_id' => $user->id,
    ]);

    $categoriaB = Categoria::query()->create([
        'nome' => 'Categoria B',
        'tipo' => 'despesa',
        'usuario_id' => $user->id,
    ]);

    // Jan/2026 (mês do período de referência)
    lancarDespesaComCategoriaNoDashboard($user, '2026-01-05', $categoriaA, 7, 0, $conta);
    lancarDespesaComCategoriaNoDashboard($user, '2026-01-25', $categoriaA, 5, 0, $conta);
    lancarDespesaComCategoriaNoDashboard($user, '2026-01-10', $categoriaB, 3, 0, $conta);

    // Fevereiro (deve ser excluído)
    lancarDespesaComCategoriaNoDashboard($user, '2026-02-10', $categoriaA, 100, 0, $conta);

    $this->actingAs($user)
        ->get(route('dashboard', ['ano' => 2026, 'mes' => 1]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('ano', 2026)
            ->where('mes', 1)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('despesasPorCategoria', 2)
                ->where('despesasPorCategoria.0.categoria', 'Categoria A')
                ->where('despesasPorCategoria.0.valor', 12)
                ->where('despesasPorCategoria.1.categoria', 'Categoria B')
                ->where('despesasPorCategoria.1.valor', 3)
            )
        );

    $this->travelBack();
});

it('shows expenses by current product group for the signed-in user using the default month range', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    $outraPessoa = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira '.$user->id,
        'usuario_id' => $user->id,
    ]);
    $categoria = Categoria::query()->create([
        'nome' => 'Produto',
        'tipo' => 'despesa',
        'usuario_id' => $user->id,
    ]);

    $hardware = Grupo::query()->create([
        'nome' => 'Hardware',
        'usuario_id' => $user->id,
    ]);
    $escritorio = Grupo::query()->create([
        'nome' => 'Escritório',
        'usuario_id' => $user->id,
    ]);

    $mouse = Produto::query()->create([
        'nome' => 'Mouse',
        'preco_compra' => 80,
        'usuario_id' => $user->id,
        'grupo_id' => $hardware->id,
    ]);
    $teclado = Produto::query()->create([
        'nome' => 'Teclado',
        'preco_compra' => 180,
        'usuario_id' => $user->id,
        'grupo_id' => $hardware->id,
    ]);
    $papel = Produto::query()->create([
        'nome' => 'Papel',
        'preco_compra' => 25,
        'usuario_id' => $user->id,
        'grupo_id' => $escritorio->id,
    ]);
    $cabo = Produto::query()->create([
        'nome' => 'Cabo',
        'preco_compra' => 15,
        'usuario_id' => $user->id,
        'grupo_id' => null,
    ]);

    lancarDespesaComProdutoNoDashboard($user, '2026-06-05', $mouse, 10, $conta, $categoria);
    lancarDespesaComProdutoNoDashboard($user, '2026-06-20', $teclado, 20, $conta, $categoria);
    lancarDespesaComProdutoNoDashboard($user, '2026-06-12', $papel, 7, $conta, $categoria);
    lancarDespesaComProdutoNoDashboard($user, '2026-06-18', $cabo, 4, $conta, $categoria);

    lancarDespesaComProdutoNoDashboard($user, '2026-05-10', $mouse, 999, $conta, $categoria);

    lancarDespesaComCategoriaNoDashboard($user, '2026-06-08', $categoria, 50, 0, $conta);

    $financeiroReceita = Financeiro::query()->create([
        'descricao' => 'RECEITA produto 2026-06-10',
        'valor' => 123,
        'tipo' => 'RECEITA',
        'usuario_id' => $user->id,
    ]);

    FinanceiroParcela::query()->create([
        'descricao' => 'RECEITA produto 2026-06-10',
        'data_vencimento' => '2026-06-10',
        'data_competencia' => '2026-06-10',
        'valor' => 123,
        'valor_pago' => 0,
        'parcela' => 1,
        'financeiro_id' => $financeiroReceita->id,
        'categoria_id' => $categoria->id,
        'produto_id' => $mouse->id,
        'conta_id' => $conta->id,
        'usuario_id' => $user->id,
    ]);

    lancarDespesaComProdutoNoDashboard($outraPessoa, '2026-06-05', Produto::query()->create([
        'nome' => 'Alheio',
        'preco_compra' => 1,
        'usuario_id' => $outraPessoa->id,
        'grupo_id' => Grupo::query()->create([
            'nome' => 'Hardware',
            'usuario_id' => $outraPessoa->id,
        ])->id,
    ]), 500);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('ano', 2026)
            ->where('mes', 6)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('despesasPorGrupoDeProduto', 3)
                ->where('despesasPorGrupoDeProduto.0.grupo', 'Escritório')
                ->where('despesasPorGrupoDeProduto.0.valor', 7)
                ->where('despesasPorGrupoDeProduto.1.grupo', 'Hardware')
                ->where('despesasPorGrupoDeProduto.1.valor', 30)
                ->where('despesasPorGrupoDeProduto.2.grupo', 'Sem grupo')
                ->where('despesasPorGrupoDeProduto.2.valor', 4)
            )
        );

    $this->travelBack();
});

it('shows expenses by product group for the month of the reference period', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira '.$user->id,
        'usuario_id' => $user->id,
    ]);
    $categoria = Categoria::query()->create([
        'nome' => 'Produto',
        'tipo' => 'despesa',
        'usuario_id' => $user->id,
    ]);
    $hardware = Grupo::query()->create([
        'nome' => 'Hardware',
        'usuario_id' => $user->id,
    ]);
    $mouse = Produto::query()->create([
        'nome' => 'Mouse',
        'preco_compra' => 80,
        'usuario_id' => $user->id,
        'grupo_id' => $hardware->id,
    ]);
    $papel = Produto::query()->create([
        'nome' => 'Papel',
        'preco_compra' => 25,
        'usuario_id' => $user->id,
        'grupo_id' => Grupo::query()->create([
            'nome' => 'Escritório',
            'usuario_id' => $user->id,
        ])->id,
    ]);

    lancarDespesaComProdutoNoDashboard($user, '2026-01-05', $mouse, 7, $conta, $categoria);
    lancarDespesaComProdutoNoDashboard($user, '2026-01-25', $mouse, 5, $conta, $categoria);
    lancarDespesaComProdutoNoDashboard($user, '2026-01-10', $papel, 3, $conta, $categoria);
    lancarDespesaComProdutoNoDashboard($user, '2026-02-10', $mouse, 100, $conta, $categoria);

    $this->actingAs($user)
        ->get(route('dashboard', ['ano' => 2026, 'mes' => 1]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('ano', 2026)
            ->where('mes', 1)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('despesasPorGrupoDeProduto', 2)
                ->where('despesasPorGrupoDeProduto.0.grupo', 'Escritório')
                ->where('despesasPorGrupoDeProduto.0.valor', 3)
                ->where('despesasPorGrupoDeProduto.1.grupo', 'Hardware')
                ->where('despesasPorGrupoDeProduto.1.valor', 12)
            )
        );

    $this->travelBack();
});

it('applies the same reference month to both expense pizzas', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira '.$user->id,
        'usuario_id' => $user->id,
    ]);
    $categoria = Categoria::query()->create([
        'nome' => 'Produto',
        'tipo' => 'despesa',
        'usuario_id' => $user->id,
    ]);
    $mouse = Produto::query()->create([
        'nome' => 'Mouse',
        'preco_compra' => 80,
        'usuario_id' => $user->id,
        'grupo_id' => Grupo::query()->create([
            'nome' => 'Hardware',
            'usuario_id' => $user->id,
        ])->id,
    ]);

    lancarDespesaComProdutoNoDashboard($user, '2026-06-05', $mouse, 30, $conta, $categoria);
    lancarDespesaComProdutoNoDashboard($user, '2026-01-05', $mouse, 90, $conta, $categoria);
    lancarDespesaComCategoriaNoDashboard($user, '2026-01-10', $categoria, 40, 0, $conta);

    $this->actingAs($user)
        ->get(route('dashboard', ['ano' => 2026, 'mes' => 1]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('despesasPorCategoria', 1)
                ->where('despesasPorCategoria.0.valor', 130)
                ->has('despesasPorGrupoDeProduto', 1)
                ->where('despesasPorGrupoDeProduto.0.grupo', 'Hardware')
                ->where('despesasPorGrupoDeProduto.0.valor', 90)
            )
        );

    $this->travelBack();
});

it('groups product expenses by the product current group after the product moves', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira '.$user->id,
        'usuario_id' => $user->id,
    ]);
    $categoria = Categoria::query()->create([
        'nome' => 'Produto',
        'tipo' => 'despesa',
        'usuario_id' => $user->id,
    ]);
    $hardware = Grupo::query()->create([
        'nome' => 'Hardware',
        'usuario_id' => $user->id,
    ]);
    $escritorio = Grupo::query()->create([
        'nome' => 'Escritório',
        'usuario_id' => $user->id,
    ]);
    $mouse = Produto::query()->create([
        'nome' => 'Mouse',
        'preco_compra' => 80,
        'usuario_id' => $user->id,
        'grupo_id' => $hardware->id,
    ]);

    lancarDespesaComProdutoNoDashboard($user, '2026-06-05', $mouse, 15, $conta, $categoria);

    $mouse->forceFill(['grupo_id' => $escritorio->id])->save();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('despesasPorGrupoDeProduto', 1)
                ->where('despesasPorGrupoDeProduto.0.grupo', 'Escritório')
                ->where('despesasPorGrupoDeProduto.0.valor', 15)
            )
        );

    $this->travelBack();
});

it('rejects an invalid reference period', function (array $query, string $campo): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->get(route('dashboard', $query))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHasErrors([$campo]);

    $this->travelBack();
})->with([
    'ano antes da janela' => [['ano' => 2020, 'mes' => 6], 'ano'],
    'ano depois da janela' => [['ano' => 2028, 'mes' => 6], 'ano'],
    'ano que não é número' => [['ano' => 'dois mil', 'mes' => 6], 'ano'],
    'mês zero' => [['ano' => 2026, 'mes' => 0], 'mes'],
    'mês treze' => [['ano' => 2026, 'mes' => 13], 'mes'],
]);

it('shows the twelve months of the reference year in the monthly series', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    lancarParcelaNoDashboard($user, 'RECEITA', '2025-03-10', 70);
    lancarParcelaNoDashboard($user, 'DESPESA', '2025-03-20', 20);
    lancarParcelaNoDashboard($user, 'RECEITA', '2026-03-10', 999);

    $this->actingAs($user)
        ->get(route('dashboard', ['ano' => 2025, 'mes' => 8]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('ano', 2025)
            ->where('mes', 8)
            ->loadDeferredProps('seriesMensais', fn (Assert $reload) => $reload
                ->has('seriesMensais.saldos', 12)
                ->where('seriesMensais.receitas.2.valor', 70)
                ->where('seriesMensais.despesas.2.valor', 20)
                ->where('seriesMensais.saldos.2.saldo', 50)
                ->where('seriesMensais.receitas.7.valor', 0)
            )
        );

    $this->travelBack();
});

it('shows seven weekday revenue bars for the current week by competencia', function (): void {
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

    lancarParcelaNoDashboard($user, 'RECEITA', '2026-06-15', 100, 0, '2026-06-15', $contaCorrente);
    lancarParcelaNoDashboard($user, 'RECEITA', '2026-06-17', 40, 0, '2026-06-17', $contaCorrente);
    lancarParcelaNoDashboard($user, 'RECEITA', '2026-06-17', 10, 10, '2026-07-01', $contaPoupanca);
    lancarParcelaNoDashboard($user, 'DESPESA', '2026-06-16', 999, 0, '2026-06-16', $contaCorrente);
    lancarParcelaNoDashboard($user, 'RECEITA', '2026-06-14', 80, 0, '2026-06-14', $contaCorrente);
    lancarParcelaNoDashboard($user, 'RECEITA', '2026-06-22', 70, 0, '2026-06-22', $contaCorrente);
    lancarParcelaNoDashboard($outraPessoa, 'RECEITA', '2026-06-17', 500, 0);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('mes', 6)
            ->where('semana', '2026-06-15')
            ->where('semanas.2.inicio', '2026-06-15')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('receitasPorDiaDaSemana', 7)
                ->where('receitasPorDiaDaSemana.0.dia', 1)
                ->where('receitasPorDiaDaSemana.0.rotulo', 'Seg')
                ->where('receitasPorDiaDaSemana.0.valor', 100)
                ->where('receitasPorDiaDaSemana.1.rotulo', 'Ter')
                ->where('receitasPorDiaDaSemana.1.valor', 0)
                ->where('receitasPorDiaDaSemana.2.rotulo', 'Qua')
                ->where('receitasPorDiaDaSemana.2.valor', 50)
                ->where('receitasPorDiaDaSemana.6.rotulo', 'Dom')
                ->where('receitasPorDiaDaSemana.6.valor', 0)
            )
        );

    $this->travelBack();
});

it('shows weekday revenues for a week that crosses into the reference month', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira '.$user->id,
        'usuario_id' => $user->id,
    ]);

    lancarParcelaNoDashboard($user, 'RECEITA', '2025-12-30', 10, 0, '2025-12-30', $conta);
    lancarParcelaNoDashboard($user, 'RECEITA', '2026-01-02', 40, 0, '2026-01-02', $conta);
    lancarParcelaNoDashboard($user, 'DESPESA', '2026-01-02', 15, 0, '2026-01-02', $conta);
    lancarParcelaNoDashboard($user, 'RECEITA', '2026-01-06', 99, 0, '2026-01-06', $conta);

    $this->actingAs($user)
        ->get(route('dashboard', ['ano' => 2026, 'mes' => 1, 'semana' => '2025-12-29']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('mes', 1)
            ->where('semana', '2025-12-29')
            ->where('semanas.0.inicio', '2025-12-29')
            ->where('semanas.0.fim', '2026-01-04')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('receitasPorDiaDaSemana', 7)
                ->where('receitasPorDiaDaSemana.1.rotulo', 'Ter')
                ->where('receitasPorDiaDaSemana.1.valor', 10)
                ->where('receitasPorDiaDaSemana.4.rotulo', 'Sex')
                ->where('receitasPorDiaDaSemana.4.valor', 40)
                ->where('receitasPorDiaDaSemana.0.valor', 0)
            )
        );

    $this->travelBack();
});

it('fills seven zero weekday revenues when the selected week has no income', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('semana', '2026-06-15')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('receitasPorDiaDaSemana', 7)
                ->where('receitasPorDiaDaSemana', function ($receitas): bool {
                    expect($receitas)->toHaveCount(7);

                    $rotulos = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

                    foreach ($receitas as $indice => $linha) {
                        expect($linha['dia'])->toBe($indice + 1)
                            ->and($linha['rotulo'])->toBe($rotulos[$indice])
                            ->and($linha['valor'])->toBe(0);
                    }

                    return true;
                })
            )
        );

    $this->travelBack();
});

it('defaults the week to the first ISO week when the reference month is not the current one', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard', ['ano' => 2026, 'mes' => 1]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('mes', 1)
            ->where('semana', '2025-12-29')
            ->where('semanas.0.inicio', '2025-12-29')
        );

    $this->travelBack();
});

it('rejects an invalid revenue week', function (array $query, string $campo): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->get(route('dashboard', $query))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHasErrors([$campo]);
})->with([
    'semana que não é data' => [['ano' => 2026, 'mes' => 6, 'semana' => 'segunda'], 'semana'],
    'semana que não começa na segunda' => [['ano' => 2026, 'mes' => 6, 'semana' => '2026-06-16'], 'semana'],
    'semana fora do mês' => [['ano' => 2026, 'mes' => 6, 'semana' => '2026-03-02'], 'semana'],
]);

/**
 * @param  array<string, int>  $vinculos
 */
function lancarParcelaNoRanking(User $user, string $tipo, string $competencia, float $valor, array $vinculos): FinanceiroParcela
{
    $financeiro = Financeiro::query()->create([
        'descricao' => $tipo.' ranking '.$competencia,
        'valor' => $valor,
        'tipo' => $tipo,
        'usuario_id' => $user->id,
    ]);

    $vinculos['categoria_id'] ??= Categoria::query()->create([
        'nome' => $tipo.' ranking '.$competencia,
        'tipo' => strtolower($tipo),
        'usuario_id' => $user->id,
    ])->id;
    $vinculos['conta_id'] ??= Conta::query()->firstOrCreate([
        'nome' => 'Carteira '.$user->id,
        'usuario_id' => $user->id,
    ])->id;

    return FinanceiroParcela::query()->create([
        'descricao' => $tipo.' ranking '.$competencia,
        'data_vencimento' => $competencia,
        'data_competencia' => $competencia,
        'valor' => $valor,
        'valor_pago' => 0,
        'parcela' => 1,
        'financeiro_id' => $financeiro->id,
        'usuario_id' => $user->id,
        ...$vinculos,
    ]);
}

it('defers each heavy dashboard block in its own group', function (): void {
    $user = User::factory()->create();

    $page = $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->missing('resumo')
            ->missing('seriesMensais')
            ->missing('despesasPorCategoria')
            ->missing('despesasPorGrupoDeProduto')
            ->missing('receitasPorDiaDaSemana')
            ->missing('ranking')
            ->has('ano')
            ->has('mes')
            ->has('anos')
            ->has('semana')
            ->has('semanas')
            ->where('rankingCriterio', 'produtos')
        )
        ->viewData('page');

    expect($page['deferredProps'])->toBe([
        'resumo' => ['resumo'],
        'seriesMensais' => ['seriesMensais'],
        'despesasPorCategoria' => ['despesasPorCategoria'],
        'despesasPorGrupoDeProduto' => ['despesasPorGrupoDeProduto'],
        'receitasPorDiaDaSemana' => ['receitasPorDiaDaSemana'],
        'ranking' => ['ranking'],
    ]);
});

it('loads a single deferred group without the other heavy blocks', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps('despesasPorCategoria', fn (Assert $reload) => $reload
                ->has('despesasPorCategoria')
                ->missing('resumo')
                ->missing('seriesMensais')
                ->missing('despesasPorGrupoDeProduto')
                ->missing('receitasPorDiaDaSemana')
                ->missing('ranking')
            )
        );
});

it('ranks the top five products by expense value in the current month with their share of the total', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();
    $outraPessoa = User::factory()->create();

    $valores = ['Bateria' => 2400, 'Aditivo' => 1300, 'Pneu' => 600, 'Bandeja' => 400, 'Amortecedor' => 200, 'Filtro' => 100];

    foreach ($valores as $nome => $valor) {
        $produto = Produto::query()->create(['nome' => $nome, 'preco_compra' => 1, 'usuario_id' => $user->id]);
        lancarParcelaNoRanking($user, 'DESPESA', '2026-06-10', $valor, ['produto_id' => $produto->id]);
    }

    $bateria = Produto::query()->where('nome', 'Bateria')->firstOrFail();
    lancarParcelaNoRanking($user, 'DESPESA', '2026-06-20', 600, ['produto_id' => $bateria->id]);
    lancarParcelaNoRanking($user, 'DESPESA', '2026-07-01', 9000, ['produto_id' => $bateria->id]);
    lancarParcelaNoRanking($user, 'RECEITA', '2026-06-10', 9000, ['produto_id' => $bateria->id]);

    $produtoAlheio = Produto::query()->create(['nome' => 'Alheio', 'preco_compra' => 1, 'usuario_id' => $outraPessoa->id]);
    lancarParcelaNoRanking($outraPessoa, 'DESPESA', '2026-06-10', 9000, ['produto_id' => $produtoAlheio->id]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('mes', 6)
            ->loadDeferredProps('ranking', fn (Assert $reload) => $reload
                ->where('ranking.criterio', 'produtos')
                ->where('ranking.total', 5600)
                ->has('ranking.itens', 5)
                ->where('ranking.itens.0', [
                    'posicao' => 1,
                    'nome' => 'Bateria',
                    'valor' => 3000,
                    'lancamentos' => 2,
                    'percentual' => 53.57,
                ])
                ->where('ranking.itens.1.nome', 'Aditivo')
                ->where('ranking.itens.1.percentual', 23.21)
                ->where('ranking.itens.4.nome', 'Amortecedor')
                ->where('ranking.itens.4.posicao', 5)
            )
        );

    $this->travelBack();
});

it('ranks suppliers and revenue categories for the month of the reference period', function (): void {
    $user = User::factory()->create();

    $acme = Fornecedor::query()->create(['nome' => 'Acme', 'usuario_id' => $user->id]);
    $beta = Fornecedor::query()->create(['nome' => 'Beta', 'usuario_id' => $user->id]);
    lancarParcelaNoRanking($user, 'DESPESA', '2026-01-10', 50, ['fornecedor_id' => $beta->id]);
    lancarParcelaNoRanking($user, 'DESPESA', '2026-01-12', 150, ['fornecedor_id' => $acme->id]);
    lancarParcelaNoRanking($user, 'DESPESA', '2026-02-12', 999, ['fornecedor_id' => $beta->id]);

    $salario = Categoria::query()->create(['nome' => 'Salário', 'tipo' => 'receita', 'usuario_id' => $user->id]);
    lancarParcelaNoRanking($user, 'RECEITA', '2026-01-05', 1000, ['categoria_id' => $salario->id]);

    $periodo = ['ano' => 2026, 'mes' => 1];

    $this->actingAs($user)
        ->get(route('dashboard', [...$periodo, 'ranking_criterio' => 'fornecedores']))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps('ranking', fn (Assert $reload) => $reload
                ->where('ranking.itens.0.nome', 'Acme')
                ->where('ranking.itens.0.percentual', 75)
                ->where('ranking.itens.1.nome', 'Beta')
                ->where('ranking.itens.1.valor', 50)
            )
        );

    $this->actingAs($user)
        ->get(route('dashboard', [...$periodo, 'ranking_criterio' => 'categorias_receita']))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps('ranking', fn (Assert $reload) => $reload
                ->has('ranking.itens', 1)
                ->where('ranking.itens.0.nome', 'Salário')
                ->where('ranking.itens.0.percentual', 100)
            )
        );
});

it('returns an empty ranking when the period has no matching parcels', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard', ['ranking_criterio' => 'categorias_despesa']))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps('ranking', fn (Assert $reload) => $reload
                ->where('ranking.total', 0)
                ->has('ranking.itens', 0)
            )
        );
});

it('rejects invalid ranking filters', function (array $query, string $campo): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->get(route('dashboard', $query))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHasErrors([$campo]);
})->with([
    'critério desconhecido' => [['ranking_criterio' => 'margem'], 'ranking_criterio'],
]);
