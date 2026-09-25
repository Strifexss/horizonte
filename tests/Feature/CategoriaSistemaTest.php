<?php

use App\Models\Categoria;
use App\Models\User;
use App\Services\Interfaces\CategoriaServiceInterface;

it('lista categorias do usuario e do sistema', function () {
    $user = User::factory()->create();
    $outro = User::factory()->create();

    Categoria::query()->create([
        'nome' => 'Receita',
        'padrao' => 1,
        'tipo' => 'receita',
        'usuario_id' => null,
    ]);

    Categoria::query()->create([
        'nome' => 'Despesa',
        'padrao' => 1,
        'tipo' => 'despesa',
        'usuario_id' => null,
    ]);

    Categoria::query()->create([
        'nome' => 'PRODUTO',
        'padrao' => 1,
        'tipo' => 'despesa',
        'usuario_id' => null,
    ]);

    Categoria::query()->create([
        'nome' => 'Minha',
        'padrao' => 0,
        'tipo' => 'despesa',
        'usuario_id' => $user->id,
    ]);

    Categoria::query()->create([
        'nome' => 'OutroUsuario',
        'padrao' => 0,
        'tipo' => 'despesa',
        'usuario_id' => $outro->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('categorias.autocomplete', ['tipo' => 'despesa']))
        ->assertOk()
        ->assertJsonFragment(['nome' => 'PRODUTO'])
        ->assertJsonFragment(['nome' => 'Despesa'])
        ->assertJsonFragment(['nome' => 'Minha'])
        ->assertJsonMissing(['nome' => 'OutroUsuario']);

    $this->actingAs($user)
        ->getJson(route('categorias.autocomplete', ['tipo' => 'receita']))
        ->assertOk()
        ->assertJsonFragment(['nome' => 'Receita'])
        ->assertJsonMissing(['nome' => 'Despesa'])
        ->assertJsonMissing(['nome' => 'PRODUTO']);
});

it('index de categorias inclui todas as padroes do sistema', function () {
    $user = User::factory()->create();

    Categoria::query()->create([
        'nome' => 'Receita',
        'padrao' => 1,
        'tipo' => 'receita',
        'usuario_id' => null,
    ]);
    Categoria::query()->create([
        'nome' => 'Despesa',
        'padrao' => 1,
        'tipo' => 'despesa',
        'usuario_id' => null,
    ]);
    Categoria::query()->create([
        'nome' => 'PRODUTO',
        'padrao' => 1,
        'tipo' => 'despesa',
        'usuario_id' => null,
    ]);

    $this->actingAs($user);

    $nomes = app(CategoriaServiceInterface::class)
        ->index()
        ->pluck('nome')
        ->all();

    expect($nomes)->toContain('Receita', 'Despesa', 'PRODUTO');
});

it('bloqueia atualizacao de categoria do sistema', function () {
    $user = User::factory()->create();
    $categoria = Categoria::query()->create([
        'nome' => 'PRODUTO',
        'padrao' => 1,
        'tipo' => 'despesa',
        'usuario_id' => null,
    ]);

    $this->actingAs($user)
        ->from(route('extrato.index'))
        ->put(route('categorias.update', $categoria->id), [
            'nome' => 'Hack',
            'tipo' => 'despesa',
        ])
        ->assertRedirect()
        ->assertSessionHas('error', 'Erro ao atualizar categoria: Categorias do sistema não podem ser alteradas ou excluídas.');
});

it('bloqueia exclusao de categoria do sistema', function () {
    $user = User::factory()->create();
    $categoria = Categoria::query()->create([
        'nome' => 'PRODUTO',
        'padrao' => 1,
        'tipo' => 'despesa',
        'usuario_id' => null,
    ]);

    $this->actingAs($user)
        ->from(route('extrato.index'))
        ->delete(route('categorias.destroy', $categoria->id))
        ->assertRedirect()
        ->assertSessionHas('error', 'Erro ao excluir categoria: Categorias do sistema não podem ser alteradas ou excluídas.');
});
