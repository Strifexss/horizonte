<?php

use App\DTO\FinanceiroDTO;
use App\Models\Conta;
use App\Models\Financeiro;
use App\Models\User;
use App\Repositories\FinanceiroRepository;
use Illuminate\Support\Facades\Auth;

it('stores and lists financeiro records for authenticated user', function () {
    $user = User::factory()->create();
    Auth::login($user);

    $data = [
        'descricao' => 'Teste',
        'valor' => 100.00,
        'tipo' => 'RECEITA',
        'conta_id' => 1,
        'usuario_id' => $user->id,
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

    $this->actingAs($user)
        ->post(route('extrato.store'), [
            'descricao' => 'Conta de luz',
            'valor' => 150.5,
            'tipo' => 'DESPESA',
            'conta_id' => $conta->id,
            'data_vencimento' => '2026-08-30',
            'valor_pago' => 50,
            'qtd_parcelas' => 3,
        ])
        ->assertRedirect(route('extrato.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('financeiro', [
        'descricao' => 'Conta de luz',
        'usuario_id' => $user->id,
        'conta_id' => $conta->id,
        'qtd_parcelas' => 3,
    ]);
});
