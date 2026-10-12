<?php

use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
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
            ->where('dataInicioDespesasPorCategoria', '2026-06-01')
            ->where('dataFimDespesasPorCategoria', '2026-06-30')
            ->where('dataInicioDespesasPorGrupo', '2026-06-01')
            ->where('dataFimDespesasPorGrupo', '2026-06-30')
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
                ->has('despesasPorCategoria', 0)
                ->has('despesasPorGrupoDeProduto', 0)
                ->has('receitasPorDiaDaSemana', 7)
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
            ->component('dashboard/index')
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
            ->where('dataInicioDespesasPorCategoria', '2026-06-01')
            ->where('dataFimDespesasPorCategoria', '2026-06-30')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('despesasPorCategoria', 1)
                ->where('despesasPorCategoria.0.categoria', 'Categoria A')
                ->where('despesasPorCategoria.0.valor', 30)
            )
        );

    $this->travelBack();
});

it('shows expenses by category for a custom competence date range (competencia)', function (): void {
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

    // Jan/2026 (range customizado)
    lancarDespesaComCategoriaNoDashboard($user, '2026-01-05', $categoriaA, 7, 0, $conta);
    lancarDespesaComCategoriaNoDashboard($user, '2026-01-25', $categoriaA, 5, 0, $conta);
    lancarDespesaComCategoriaNoDashboard($user, '2026-01-10', $categoriaB, 3, 0, $conta);

    // Fevereiro (deve ser excluído)
    lancarDespesaComCategoriaNoDashboard($user, '2026-02-10', $categoriaA, 100, 0, $conta);

    $this->actingAs($user)
        ->get(route('dashboard', [
            'data_inicio' => '2026-01-01',
            'data_fim' => '2026-01-31',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('ano', 2026)
            ->where('dataInicioDespesasPorCategoria', '2026-01-01')
            ->where('dataFimDespesasPorCategoria', '2026-01-31')
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
            ->where('dataInicioDespesasPorGrupo', '2026-06-01')
            ->where('dataFimDespesasPorGrupo', '2026-06-30')
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

it('shows expenses by product group for a custom competence date range', function (): void {
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
        ->get(route('dashboard', [
            'grupo_data_inicio' => '2026-01-01',
            'grupo_data_fim' => '2026-01-31',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('ano', 2026)
            ->where('dataInicioDespesasPorGrupo', '2026-01-01')
            ->where('dataFimDespesasPorGrupo', '2026-01-31')
            ->where('dataInicioDespesasPorCategoria', '2026-06-01')
            ->where('dataFimDespesasPorCategoria', '2026-06-30')
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

it('keeps the group pizza on the current month when only the category range changes', function (): void {
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
        ->get(route('dashboard', [
            'data_inicio' => '2026-01-01',
            'data_fim' => '2026-01-31',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('dataInicioDespesasPorCategoria', '2026-01-01')
            ->where('dataFimDespesasPorCategoria', '2026-01-31')
            ->where('dataInicioDespesasPorGrupo', '2026-06-01')
            ->where('dataFimDespesasPorGrupo', '2026-06-30')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('despesasPorCategoria', 1)
                ->where('despesasPorCategoria.0.valor', 130)
                ->has('despesasPorGrupoDeProduto', 1)
                ->where('despesasPorGrupoDeProduto.0.grupo', 'Hardware')
                ->where('despesasPorGrupoDeProduto.0.valor', 30)
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

it('rejects a pizza date range whose end is before the start', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->get(route('dashboard', [
            'data_inicio' => '2026-02-01',
            'data_fim' => '2026-01-01',
        ]))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHasErrors(['data_fim']);
});

it('rejects a group pizza date range whose end is before the start', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->get(route('dashboard', [
            'grupo_data_inicio' => '2026-02-01',
            'grupo_data_fim' => '2026-01-01',
        ]))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHasErrors(['grupo_data_fim']);
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
            ->where('mesReceitas', '2026-06')
            ->where('semanaReceitas', '2026-06-15')
            ->where('semanasReceitas.2.inicio', '2026-06-15')
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

it('shows weekday revenues for a custom month and week that crosses the month boundary', function (): void {
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
        ->get(route('dashboard', [
            'mes_receitas' => '2026-01',
            'semana_receitas' => '2025-12-29',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('mesReceitas', '2026-01')
            ->where('semanaReceitas', '2025-12-29')
            ->where('semanasReceitas.0.inicio', '2025-12-29')
            ->where('semanasReceitas.0.fim', '2026-01-04')
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
            ->where('semanaReceitas', '2026-06-15')
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

it('defaults the week to the first ISO week of a custom month when semana is omitted', function (): void {
    $this->travelTo('2026-06-15');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard', [
            'mes_receitas' => '2026-01',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('mesReceitas', '2026-01')
            ->where('semanaReceitas', '2025-12-29')
            ->where('semanasReceitas.0.inicio', '2025-12-29')
        );

    $this->travelBack();
});

it('rejects invalid month and week filters for weekday revenues', function (array $query, string $campo): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->get(route('dashboard', $query))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHasErrors([$campo]);
})->with([
    'mes inválido' => [['mes_receitas' => '2026-13'], 'mes_receitas'],
    'semana que não é data' => [['mes_receitas' => '2026-06', 'semana_receitas' => 'segunda'], 'semana_receitas'],
    'semana que não começa na segunda' => [['mes_receitas' => '2026-06', 'semana_receitas' => '2026-06-16'], 'semana_receitas'],
    'semana fora do mês' => [['mes_receitas' => '2026-06', 'semana_receitas' => '2026-03-02'], 'semana_receitas'],
]);
