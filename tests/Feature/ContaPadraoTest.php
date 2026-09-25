<?php

use App\Models\Conta;
use App\Models\User;

it('define apenas uma conta padrao por usuario', function () {
    $user = User::factory()->create();

    $primeira = Conta::query()->create([
        'nome' => 'Carteira',
        'usuario_id' => $user->id,
        'padrao' => 1,
    ]);

    $this->actingAs($user)
        ->post(route('contas.store'), [
            'nome' => 'Banco',
            'descricao' => 'Principal',
            'padrao' => true,
        ])
        ->assertRedirect(route('contas'))
        ->assertSessionHas('success');

    expect(Conta::query()->where('usuario_id', $user->id)->where('padrao', 1)->count())->toBe(1);
    expect(Conta::query()->where('nome', 'Banco')->value('padrao'))->toBe(1);
    expect(Conta::query()->where('id', $primeira->id)->value('padrao'))->toBe(0);
});

it('ao atualizar conta como padrao remove o padrao das demais', function () {
    $user = User::factory()->create();

    $a = Conta::query()->create([
        'nome' => 'A',
        'usuario_id' => $user->id,
        'padrao' => 1,
    ]);
    $b = Conta::query()->create([
        'nome' => 'B',
        'usuario_id' => $user->id,
        'padrao' => 0,
    ]);

    $this->actingAs($user)
        ->put(route('contas.update', $b->id), [
            'nome' => 'B',
            'descricao' => null,
            'padrao' => true,
        ])
        ->assertRedirect(route('contas'));

    expect(Conta::query()->where('id', $a->id)->value('padrao'))->toBe(0);
    expect(Conta::query()->where('id', $b->id)->value('padrao'))->toBe(1);
});

it('autocomplete retorna flag padrao das contas do usuario', function () {
    $user = User::factory()->create();

    Conta::query()->create([
        'nome' => 'Padrão',
        'usuario_id' => $user->id,
        'padrao' => 1,
    ]);

    $this->actingAs($user)
        ->getJson(route('contas.autocomplete'))
        ->assertOk()
        ->assertJsonFragment(['nome' => 'Padrão', 'padrao' => 1]);
});
