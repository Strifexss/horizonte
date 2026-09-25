<?php

use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Funcionario;
use App\Models\Produto;
use App\Models\User;

it('busca produtos ignorando acentos no autocomplete', function () {
    $user = User::factory()->create();

    Produto::query()->create([
        'nome' => 'Pão Francês',
        'preco_compra' => 5.5,
        'usuario_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('produtos.autocomplete', ['q' => 'Pao']))
        ->assertOk()
        ->assertJsonFragment(['nome' => 'Pão Francês']);
});

it('busca contas ignorando acentos no autocomplete', function () {
    $user = User::factory()->create();

    Conta::query()->create([
        'nome' => 'Poupança',
        'usuario_id' => $user->id,
        'padrao' => 0,
    ]);

    $this->actingAs($user)
        ->getJson(route('contas.autocomplete', ['q' => 'poupanca']))
        ->assertOk()
        ->assertJsonFragment(['nome' => 'Poupança']);
});

it('busca funcionarios ignorando acentos no autocomplete', function () {
    $user = User::factory()->create();

    Funcionario::query()->create([
        'nome' => 'José Antônio',
        'salario' => 2000,
        'usuario_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('funcionarios.autocomplete', ['q' => 'Jose Antonio']))
        ->assertOk()
        ->assertJsonFragment(['nome' => 'José Antônio']);
});

it('busca categorias ignorando acentos no autocomplete', function () {
    $user = User::factory()->create();

    Categoria::query()->create([
        'nome' => 'Alimentação',
        'tipo' => 'despesa',
        'padrao' => 0,
        'usuario_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('categorias.autocomplete', ['q' => 'Alimentacao', 'tipo' => 'despesa']))
        ->assertOk()
        ->assertJsonFragment(['nome' => 'Alimentação']);
});
