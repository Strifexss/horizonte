<?php

use App\Models\Produto;
use App\Models\User;
use Illuminate\Support\Facades\DB;

function produtoDaEmpresa(User $user, array $atributos = []): Produto
{
    return Produto::query()->create([
        'nome' => 'Café',
        'preco_compra' => 10,
        'usuario_id' => $user->id,
        ...$atributos,
    ]);
}

it('gera codigo sequencial por empresa quando o produto nasce sem codigo', function (): void {
    $user = User::factory()->create();
    $outro = User::factory()->create();

    $primeiro = produtoDaEmpresa($user);
    $segundo = produtoDaEmpresa($user, ['nome' => 'Pão']);
    $doOutro = produtoDaEmpresa($outro);

    expect($primeiro->codigo)->toBe('1')
        ->and($segundo->codigo)->toBe('2')
        ->and($doOutro->codigo)->toBe('1');
});

it('mantem o codigo informado e continua a sequencia ignorando EAN', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('produtos.store'), [
        'nome' => 'Água',
        'preco_compra' => 1,
        'codigo' => ' 7894900011517 ',
    ])->assertSessionHasNoErrors();

    produtoDaEmpresa($user, ['codigo' => '41']);

    $this->actingAs($user)->post(route('produtos.store'), [
        'nome' => 'Suco',
        'preco_compra' => 3,
        'codigo' => '',
    ])->assertSessionHasNoErrors();

    expect(Produto::query()->where('nome', 'Água')->value('codigo'))->toBe('7894900011517')
        ->and(Produto::query()->where('nome', 'Suco')->value('codigo'))->toBe('42');
});

it('nao aceita codigo repetido na mesma empresa, mas aceita em outra empresa e na edicao do proprio produto', function (): void {
    $user = User::factory()->create();
    $outro = User::factory()->create();
    $cafe = produtoDaEmpresa($user, ['codigo' => 'CAF01']);

    $this->actingAs($user)
        ->post(route('produtos.store'), ['nome' => 'Outro café', 'preco_compra' => 5, 'codigo' => 'CAF01'])
        ->assertSessionHasErrors(['codigo' => 'Já existe um produto com este código.']);

    $this->actingAs($user)
        ->put(route('produtos.update', ['id' => $cafe->id]), ['nome' => 'Café coado', 'preco_compra' => 5, 'codigo' => 'CAF01'])
        ->assertSessionHasNoErrors();

    $this->actingAs($outro)
        ->post(route('produtos.store'), ['nome' => 'Café', 'preco_compra' => 5, 'codigo' => 'CAF01'])
        ->assertSessionHasNoErrors();

    expect(Produto::query()->where('codigo', 'CAF01')->count())->toBe(2);
});

it('salva o favorito pelo cadastro e alterna pela lista', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('produtos.store'), ['nome' => 'Misto', 'preco_compra' => 4, 'favorito' => true])
        ->assertSessionHasNoErrors();

    $misto = Produto::query()->where('nome', 'Misto')->firstOrFail();
    expect($misto->favorito)->toBeTrue();

    $this->actingAs($user)
        ->patch(route('produtos.favorito', ['id' => $misto->id]), ['favorito' => false])
        ->assertSessionHas('success');

    expect($misto->fresh()->favorito)->toBeFalse();
});

it('nao altera o favorito de produto de outra empresa', function (): void {
    $alheio = produtoDaEmpresa(User::factory()->create());

    $this->actingAs(User::factory()->create())
        ->patch(route('produtos.favorito', ['id' => $alheio->id]), ['favorito' => true])
        ->assertNotFound();

    expect($alheio->fresh()->favorito)->toBeFalse();
});

it('a migration numera os produtos existentes por empresa na ordem de cadastro', function (): void {
    $user = User::factory()->create();
    $outro = User::factory()->create();
    $a = produtoDaEmpresa($user, ['nome' => 'A']);
    $b = produtoDaEmpresa($outro, ['nome' => 'B']);
    $c = produtoDaEmpresa($user, ['nome' => 'C', 'codigo' => '7894900011517']);

    $migration = require database_path('migrations/2026_11_02_100000_add_codigo_e_favorito_to_produto_table.php');
    $migration->down();
    $migration->up();

    expect(DB::table('produto')->whereIn('id', [$a->id, $b->id, $c->id])->orderBy('id')->pluck('codigo')->all())
        ->toBe(['1', '1', '2']);
});
