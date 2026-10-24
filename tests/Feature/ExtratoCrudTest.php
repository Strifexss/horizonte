<?php

use App\DTO\FinanceiroDTO;
use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\Produto;
use App\Models\User;
use App\Repositories\FinanceiroRepository;
use Illuminate\Support\Facades\Auth;
use Inertia\Testing\AssertableInertia as Assert;

it('stores and lists financeiro records for authenticated user', function () {
    $user = User::factory()->create();
    Auth::login($user);

    $data = [
        'descricao' => 'Teste',
        'valor' => 100.00,
        'tipo' => 'RECEITA',
        'conta_id' => 1,
        'usuario_id' => $user->id,
        'forma_pagamento_id' => formaPagamentoEspecieId(),
    ];

    // store via repository
    $repo = app(FinanceiroRepository::class);
    $created = $repo->store($data);
    expect($created)->toBeInstanceOf(Financeiro::class);
    expect($created->usuario_id)->toBe($user->id);

    $lista = $repo->index();
    expect($lista)->toHaveCount(1);
});

it('redirects guests from extrato store to login', function () {
    $this->post(route('extrato.store'), [])
        ->assertRedirect(route('login'));
});

it('rejects extrato store when required fields are missing', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('extrato.index'))
        ->post(route('extrato.store'), [])
        ->assertRedirect(route('extrato.index'))
        ->assertSessionHasErrors(['descricao', 'valor', 'tipo', 'conta_id', 'data_vencimento', 'qtd_parcelas']);
});

it('rejects extrato store when qtd_parcelas is less than one', function () {
    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira',
        'usuario_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->from(route('extrato.index'))
        ->post(route('extrato.store'), [
            'descricao' => 'Parcela inválida',
            'valor' => 10,
            'tipo' => 'DESPESA',
            'conta_id' => $conta->id,
            'data_vencimento' => '2026-08-30',
            'valor_pago' => 10,
            'qtd_parcelas' => 0,
            'forma_pagamento_id' => formaPagamentoEspecieId(),
        ])
        ->assertRedirect(route('extrato.index'))
        ->assertSessionHasErrors(['qtd_parcelas']);
});

it('maps validated extrato payload onto FinanceiroDTO', function () {
    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira',
        'usuario_id' => $user->id,
    ]);

    $dto = FinanceiroDTO::fromArray([
        'descricao' => 'Conta de luz',
        'valor' => 150.5,
        'tipo' => 'DESPESA',
        'conta_id' => $conta->id,
        'usuario_id' => $user->id,
        'data_vencimento' => '2026-08-30',
        'valor_pago' => 50,
        'qtd_parcelas' => 3,
        'forma_pagamento_id' => formaPagamentoEspecieId(),
    ]);

    expect($dto->data_vencimento)->toBe('2026-08-30')
        ->and((float) $dto->valor_pago)->toBe(50.0)
        ->and($dto->qtd_parcelas)->toBe(3);
});

it('creates a lancamento when extrato store payload is valid', function () {
    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira',
        'usuario_id' => $user->id,
    ]);

    $categoria = Categoria::query()->create([
        'nome' => 'Despesa',
        'usuario_id' => $user->id,
        'tipo' => 'despesa',
    ]);

    $this->actingAs($user)
        ->post(route('extrato.store'), [
            'descricao' => 'Conta de luz',
            'valor' => 150.5,
            'tipo' => 'DESPESA',
            'conta_id' => $conta->id,
            'categoria_id' => $categoria->id,
            'data_vencimento' => '2026-08-30',
            'valor_pago' => 50,
            'qtd_parcelas' => 3,
            'forma_pagamento_id' => formaPagamentoEspecieId(),
        ])
        ->assertRedirect(route('extrato.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('financeiro', [
        'descricao' => 'Conta de luz',
        'usuario_id' => $user->id,
    ]);

    $this->assertDatabaseHas('financeiro_parcela', [
        'descricao' => 'Conta de luz',
        'usuario_id' => $user->id,
        'data_competencia' => '2026-08-30',
        'data_vencimento' => '2026-08-30',
    ]);
});

it('renders the extrato index for the signed-in user', function (): void {
    $this->withoutVite();

    config([
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('extrato.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('extrato/index'));
});

it('persists quantidade on create, shows it on extrato, and keeps it after edit', function (): void {
    $this->withoutVite();

    config([
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);

    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira',
        'usuario_id' => $user->id,
    ]);
    $categoria = Categoria::query()->create([
        'nome' => 'PRODUTO',
        'padrao' => 1,
        'tipo' => 'despesa',
        'usuario_id' => null,
    ]);
    $produto = Produto::query()->create([
        'nome' => 'Café',
        'preco_compra' => 10,
        'usuario_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->post(route('extrato.store'), [
            'descricao' => 'Compra café',
            'valor' => 50,
            'tipo' => 'DESPESA',
            'conta_id' => $conta->id,
            'categoria_id' => $categoria->id,
            'produto_id' => $produto->id,
            'quantidade' => 5,
            'data_vencimento' => '2026-10-14',
            'data_competencia' => '2026-10-14',
            'valor_pago' => 50,
            'qtd_parcelas' => 1,
            'forma_pagamento_id' => formaPagamentoEspecieId(),
        ])
        ->assertRedirect(route('extrato.index'))
        ->assertSessionHas('success');

    $parcela = FinanceiroParcela::query()
        ->where('usuario_id', $user->id)
        ->where('descricao', 'Compra café')
        ->firstOrFail();

    expect($parcela->quantidade)->toBe(5);

    $this->actingAs($user)
        ->get(route('extrato.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('extrato/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('parcelas.data.0.quantidade', 5)
                ->where('parcelas.data.0.produto_id', $produto->id)
            )
        );

    $this->actingAs($user)
        ->put(route('parcela.update', ['id' => $parcela->id]), [
            'descricao' => 'Compra café',
            'valor' => 30,
            'tipo' => 'DESPESA',
            'conta_id' => $conta->id,
            'categoria_id' => $categoria->id,
            'produto_id' => $produto->id,
            'quantidade' => 3,
            'data_vencimento' => '2026-10-14',
            'data_competencia' => '2026-10-14',
            'valor_pago' => 30,
        ])
        ->assertRedirect(route('extrato.index'))
        ->assertSessionHas('success');

    $parcela->refresh();

    expect($parcela->quantidade)->toBe(3)
        ->and((float) $parcela->valor)->toBe(30.0);

    $this->actingAs($user)
        ->get(route('extrato.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('extrato/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('parcelas.data.0.quantidade', 3)
            )
        );
});
