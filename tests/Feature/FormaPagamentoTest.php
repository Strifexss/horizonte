<?php

use App\Models\Financeiro;
use App\Models\FormaPagamento;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function formaPropria(User $user, array $atributos = []): FormaPagamento
{
    return FormaPagamento::query()->create([
        'nome' => 'Boleto',
        'usuario_id' => $user->id,
        ...$atributos,
    ]);
}

it('lista as formas padrao e as proprias do usuario, sem as de outro usuario', function (): void {
    $this->withoutVite();
    config(['inertia.testing.page_paths' => [resource_path('js/pages')]]);

    $user = User::factory()->create();
    formaPropria($user, ['nome' => 'Vale']);
    formaPropria(User::factory()->create(), ['nome' => 'Alheia']);

    $this->actingAs($user)
        ->get(route('formas-pagamento'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('formas-pagamento/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('formas_pagamento.data', 5)
                ->where('formas_pagamento.data.0.padrao', true)
                ->where('formas_pagamento.data.4.nome', 'Vale')
                ->where('formas_pagamento.data.4.padrao', false)
            )
        );
});

it('cria forma propria com baixa automatica ligada por padrao', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('formas-pagamento.store'), ['nome' => 'Vale refeição'])
        ->assertSessionHas('success');

    $forma = FormaPagamento::query()->where('nome', 'Vale refeição')->firstOrFail();

    expect($forma->usuario_id)->toBe($user->id)
        ->and($forma->padrao)->toBe(0)
        ->and($forma->baixa_automatica)->toBeTrue()
        ->and($forma->ativo)->toBeTrue();
});

it('rejeita nome repetido de forma padrao ou propria', function (string $nome): void {
    $user = User::factory()->create();
    formaPropria($user, ['nome' => 'Boleto']);

    $this->actingAs($user)
        ->post(route('formas-pagamento.store'), ['nome' => $nome])
        ->assertSessionHasErrors('nome');
})->with(['padrao' => 'Pix', 'propria' => 'Boleto']);

it('aceita nome igual ao de uma forma de outro usuario', function (): void {
    formaPropria(User::factory()->create(), ['nome' => 'Boleto']);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('formas-pagamento.store'), ['nome' => 'Boleto'])
        ->assertSessionHasNoErrors();

    expect(FormaPagamento::query()->where('nome', 'Boleto')->count())->toBe(2);
});

it('bloqueia alterar e excluir forma padrao', function (): void {
    $user = User::factory()->create();
    $pix = FormaPagamento::query()->where('nome', 'Pix')->whereNull('usuario_id')->firstOrFail();

    $this->actingAs($user)
        ->put(route('formas-pagamento.update', ['id' => $pix->id]), ['nome' => 'Pix 2'])
        ->assertSessionHas('error');

    $this->actingAs($user)
        ->delete(route('formas-pagamento.destroy', ['id' => $pix->id]))
        ->assertSessionHas('error');

    expect($pix->fresh()->nome)->toBe('Pix');
});

it('nao altera forma de outro usuario', function (): void {
    $alheia = formaPropria(User::factory()->create());

    $this->actingAs(User::factory()->create())
        ->put(route('formas-pagamento.update', ['id' => $alheia->id]), ['nome' => 'Invadida'])
        ->assertNotFound();

    expect($alheia->fresh()->nome)->toBe('Boleto');
});

it('bloqueia excluir forma usada e permite desativar', function (): void {
    $user = User::factory()->create();
    $forma = formaPropria($user);
    Financeiro::query()->create([
        'descricao' => 'Conta paga no boleto',
        'valor' => 10,
        'tipo' => 'DESPESA',
        'usuario_id' => $user->id,
        'forma_pagamento_id' => $forma->id,
    ]);

    $this->actingAs($user)
        ->delete(route('formas-pagamento.destroy', ['id' => $forma->id]))
        ->assertSessionHas('error');

    expect(FormaPagamento::query()->whereKey($forma->id)->exists())->toBeTrue();

    $this->actingAs($user)
        ->put(route('formas-pagamento.update', ['id' => $forma->id]), ['nome' => 'Boleto', 'ativo' => false])
        ->assertSessionHas('success');

    expect($forma->fresh()->ativo)->toBeFalse();
});

it('exclui forma propria sem uso', function (): void {
    $user = User::factory()->create();
    $forma = formaPropria($user);

    $this->actingAs($user)
        ->delete(route('formas-pagamento.destroy', ['id' => $forma->id]))
        ->assertSessionHas('success');

    expect(FormaPagamento::query()->whereKey($forma->id)->exists())->toBeFalse();
});

it('autocomplete traz so formas ativas visiveis ao usuario', function (): void {
    $user = User::factory()->create();
    formaPropria($user, ['nome' => 'Inativa', 'ativo' => false]);
    formaPropria($user, ['nome' => 'Vale']);
    formaPropria(User::factory()->create(), ['nome' => 'Alheia']);

    $this->actingAs($user)
        ->getJson(route('formas-pagamento.autocomplete'))
        ->assertOk()
        ->assertJsonFragment(['nome' => 'Pix'])
        ->assertJsonFragment(['nome' => 'Vale'])
        ->assertJsonMissing(['nome' => 'Inativa'])
        ->assertJsonMissing(['nome' => 'Alheia']);
});
