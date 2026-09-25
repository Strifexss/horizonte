<?php

use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\Produto;
use App\Models\User;

it('cria produto vinculado ao usuario autenticado', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('produtos.store'), [
            'nome' => 'Notebook',
            'preco_compra' => 2500.5,
        ])
        ->assertRedirect(route('extrato.index'))
        ->assertSessionHas('success')
        ->assertSessionHas('produto_criado');

    $this->assertDatabaseHas('produto', [
        'nome' => 'Notebook',
        'usuario_id' => $user->id,
        'preco_compra' => 2500.5,
    ]);
});

it('nao lista produtos de outro usuario no autocomplete', function () {
    $user = User::factory()->create();
    $outro = User::factory()->create();

    Produto::query()->create([
        'nome' => 'Meu Produto',
        'preco_compra' => 10,
        'usuario_id' => $user->id,
    ]);

    Produto::query()->create([
        'nome' => 'Produto Alheio',
        'preco_compra' => 20,
        'usuario_id' => $outro->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('produtos.autocomplete'))
        ->assertOk()
        ->assertJsonFragment(['nome' => 'Meu Produto'])
        ->assertJsonMissing(['nome' => 'Produto Alheio']);
});

it('ao excluir produto limpa produto_id nas parcelas', function () {
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
        'nome' => 'Mouse',
        'preco_compra' => 80,
        'usuario_id' => $user->id,
    ]);
    $financeiro = Financeiro::query()->create([
        'descricao' => 'Compra mouse',
        'valor' => 80,
        'tipo' => 'DESPESA',
        'usuario_id' => $user->id,
    ]);
    $parcela = FinanceiroParcela::query()->create([
        'descricao' => 'Compra mouse',
        'data_vencimento' => now()->toDateString(),
        'data_competencia' => now()->toDateString(),
        'valor' => 80,
        'valor_pago' => 0,
        'parcela' => 1,
        'financeiro_id' => $financeiro->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'produto_id' => $produto->id,
        'usuario_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->delete(route('produtos.destroy', $produto->id))
        ->assertRedirect(route('extrato.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('produto', ['id' => $produto->id]);
    $this->assertDatabaseHas('financeiro_parcela', [
        'id' => $parcela->id,
        'produto_id' => null,
    ]);
});

it('persiste produto_id ao criar lancamento de despesa', function () {
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
        'nome' => 'Teclado',
        'preco_compra' => 150,
        'usuario_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->post(route('extrato.store'), [
            'descricao' => 'Compra teclado',
            'valor' => 150,
            'tipo' => 'DESPESA',
            'conta_id' => $conta->id,
            'categoria_id' => $categoria->id,
            'produto_id' => $produto->id,
            'data_vencimento' => '2026-09-25',
            'valor_pago' => 150,
            'qtd_parcelas' => 1,
        ])
        ->assertRedirect(route('extrato.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('financeiro_parcela', [
        'descricao' => 'Compra teclado',
        'produto_id' => $produto->id,
        'categoria_id' => $categoria->id,
        'usuario_id' => $user->id,
    ]);
});
