<?php

use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Empresa;
use App\Models\MenuBoard;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Support\Facades\DB;

function colegaDe(User $dono): User
{
    $colega = User::factory()->semEmpresa()->create();
    $colega->empresas()->attach($dono->empresa()->id, ['cargo' => Empresa::CARGO_GERENTE]);

    return $colega;
}

it('grava o registro na empresa ativa com o usuario como autor', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('produtos.store'), ['nome' => 'Notebook', 'preco_compra' => 100]);

    $this->assertDatabaseHas('produto', [
        'nome' => 'Notebook',
        'empresa_id' => $user->empresa()->id,
        'usuario_id' => $user->id,
    ]);
});

it('mostra os dados da empresa para outro usuario da mesma empresa', function () {
    $dono = User::factory()->create();
    $colega = colegaDe($dono);
    Produto::query()->create(['nome' => 'Cafe', 'preco_compra' => 10, 'usuario_id' => $dono->id]);
    Conta::query()->create(['nome' => 'Caixa da loja', 'usuario_id' => $dono->id]);

    $this->actingAs($colega)
        ->getJson(route('produtos.autocomplete'))
        ->assertOk()
        ->assertJsonFragment(['nome' => 'Cafe']);

    $this->actingAs($colega)
        ->getJson(route('contas.autocomplete'))
        ->assertOk()
        ->assertJsonFragment(['nome' => 'Caixa da loja']);
});

it('nao mostra nem altera dados de outra empresa', function () {
    $user = User::factory()->create();
    $outro = User::factory()->create();
    $produtoAlheio = Produto::query()->create(['nome' => 'Produto Alheio', 'preco_compra' => 20, 'usuario_id' => $outro->id]);

    $this->actingAs($user)
        ->getJson(route('produtos.autocomplete'))
        ->assertJsonMissing(['nome' => 'Produto Alheio']);

    $this->actingAs($user)->delete(route('produtos.destroy', $produtoAlheio->id))->assertNotFound();
    $this->actingAs($user)->put(route('produtos.update', $produtoAlheio->id), ['nome' => 'Invadido', 'preco_compra' => 1])->assertSessionHas('error');

    $this->assertDatabaseHas('produto', ['id' => $produtoAlheio->id, 'nome' => 'Produto Alheio']);
});

it('ignora usuario_id enviado no formulario e grava na empresa de quem esta logado', function () {
    $user = User::factory()->create();
    $outro = User::factory()->create();

    $this->actingAs($user)->post(route('produtos.store'), ['nome' => 'Teclado', 'preco_compra' => 50, 'usuario_id' => $outro->id]);

    $this->assertDatabaseHas('produto', ['nome' => 'Teclado', 'empresa_id' => $user->empresa()->id, 'usuario_id' => $user->id]);
    $this->assertDatabaseMissing('produto', ['nome' => 'Teclado', 'empresa_id' => $outro->empresa()->id]);
});

it('mantem as categorias padrao do sistema visiveis para todas as empresas', function () {
    $user = User::factory()->create();
    $padrao = Categoria::query()->whereNull('empresa_id')->where('padrao', 1)->firstOrFail();

    $this->actingAs($user)
        ->getJson(route('categorias.autocomplete'))
        ->assertOk()
        ->assertJsonFragment(['nome' => $padrao->nome]);
});

it('ativa um unico menu board por empresa, mesmo ativado por usuarios diferentes', function () {
    $dono = User::factory()->restaurante()->create();
    $colega = colegaDe($dono);
    $primeiro = MenuBoard::query()->create(['nome' => 'Manha', 'tema' => 'dark', 'usuario_id' => $dono->id, 'ativo' => true]);
    $segundo = MenuBoard::query()->create(['nome' => 'Noite', 'tema' => 'dark', 'usuario_id' => $dono->id]);

    $this->actingAs($colega)->post(route('menu-boards.ativar', $segundo->id))->assertRedirect();

    expect($primeiro->fresh()->ativo)->toBeFalsy()
        ->and($segundo->fresh()->ativo)->toBeTruthy();
});

it('preenche a empresa dos dados antigos a partir do dono na migracao', function () {
    $user = User::factory()->create();
    $produto = Produto::query()->create(['nome' => 'Antigo', 'preco_compra' => 5, 'usuario_id' => $user->id]);
    $migracao = require database_path('migrations/2026_10_30_200003_add_empresa_id_to_tabelas_de_dados.php');

    $migracao->down();
    $migracao->up();

    expect(DB::table('produto')->where('id', $produto->id)->value('empresa_id'))->toBe($user->empresa()->id);
});
