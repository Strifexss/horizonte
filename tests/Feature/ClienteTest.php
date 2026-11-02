<?php

use App\Models\Cliente;
use App\Models\Produto;
use App\Models\User;
use App\Models\Venda;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    config(['inertia.testing.page_paths' => [resource_path('js/pages')]]);
});

function clienteDe(User $user, array $atributos = []): Cliente
{
    return Cliente::factory()->create(['usuario_id' => $user->id, ...$atributos]);
}

function vendaAbertaPara(User $user, ?Cliente $cliente = null): void
{
    $produto = Produto::query()->create([
        'nome' => 'Café',
        'preco_compra' => 2,
        'preco_venda' => 6.5,
        'usuario_id' => $user->id,
    ]);

    test()->actingAs($user)->post(route('vendas.store'), [
        'cliente_id' => $cliente?->id,
        'itens' => [['produto_id' => $produto->id, 'quantidade' => 1, 'valor_unitario' => 6.5]],
    ])->assertSessionHasNoErrors();
}

it('lista o CONSUMIDOR primeiro e so os clientes da empresa', function (): void {
    $user = User::factory()->create();
    clienteDe($user, ['nome' => 'Ana Souza']);
    clienteDe(User::factory()->create(), ['nome' => 'Cliente Alheio']);

    $this->actingAs($user)
        ->get(route('clientes'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('clientes/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('clientes.data', 2)
                ->where('clientes.data.0.nome', Cliente::NOME_CONSUMIDOR)
                ->where('clientes.data.0.padrao', true)
                ->where('clientes.data.1.nome', 'Ana Souza')
            )
        );
});

it('busca clientes por nome, telefone ou documento', function (string $busca): void {
    $user = User::factory()->create();
    clienteDe($user, ['nome' => 'José Lima', 'telefone' => '(11) 98765-4321', 'documento' => '123.456.789-09']);
    clienteDe($user, ['nome' => 'Maria', 'telefone' => null, 'documento' => null]);

    $this->actingAs($user)
        ->getJson(route('clientes.autocomplete', ['q' => $busca]))
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonPath('0.nome', 'José Lima');
})->with(['jose', '98765', '456.789']);

it('cadastra e altera cliente da empresa', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('clientes.store'), ['nome' => 'Bar do Zé', 'telefone' => '(11) 3456-7890'])
        ->assertSessionHasNoErrors()
        ->assertSessionHas('cliente_criado');

    $cliente = Cliente::query()->where('nome', 'Bar do Zé')->firstOrFail();
    expect($cliente->empresa_id)->toBe($user->empresa()->id);

    $this->actingAs($user)
        ->put(route('clientes.update', ['id' => $cliente->id]), ['nome' => 'Bar do Zé', 'telefone' => '', 'ativo' => false])
        ->assertSessionHas('success');

    expect($cliente->fresh())->telefone->toBeNull()->ativo->toBeFalse();
});

it('valida nome e e-mail do cliente', function (): void {
    $this->actingAs(User::factory()->create())
        ->post(route('clientes.store'), ['nome' => '', 'email' => 'invalido'])
        ->assertSessionHasErrors(['nome', 'email']);
});

it('nao altera nem exclui o CONSUMIDOR', function (): void {
    $user = User::factory()->create();
    $consumidorId = Cliente::consumidorId();

    $this->actingAs($user)
        ->put(route('clientes.update', ['id' => $consumidorId]), ['nome' => 'Outro nome'])
        ->assertSessionHas('error');

    $this->actingAs($user)
        ->delete(route('clientes.destroy', ['id' => $consumidorId]))
        ->assertSessionHas('error');

    expect(Cliente::query()->find($consumidorId)->nome)->toBe(Cliente::NOME_CONSUMIDOR);
});

it('nao exclui cliente com venda, mas exclui cliente sem venda', function (): void {
    $user = User::factory()->create();
    $comVenda = clienteDe($user);
    $semVenda = clienteDe($user);
    vendaAbertaPara($user, $comVenda);

    $this->actingAs($user)
        ->delete(route('clientes.destroy', ['id' => $comVenda->id]))
        ->assertSessionHas('error', 'Não é possível excluir este cliente porque ele tem vendas. Você pode inativá-lo.');

    $this->actingAs($user)
        ->delete(route('clientes.destroy', ['id' => $semVenda->id]))
        ->assertSessionHas('success');

    expect(Cliente::query()->whereKey($comVenda->id)->exists())->toBeTrue()
        ->and(Cliente::query()->whereKey($semVenda->id)->exists())->toBeFalse();
});

it('nao altera nem exclui cliente de outra empresa', function (): void {
    $alheio = clienteDe(User::factory()->create());
    $user = User::factory()->create();

    $this->actingAs($user)->put(route('clientes.update', ['id' => $alheio->id]), ['nome' => 'X'])->assertNotFound();
    $this->actingAs($user)->delete(route('clientes.destroy', ['id' => $alheio->id]))->assertNotFound();
});

it('venda sem cliente fica com o CONSUMIDOR e venda com cliente guarda o cliente', function (): void {
    $user = User::factory()->create();
    $ana = clienteDe($user, ['nome' => 'Ana']);

    vendaAbertaPara($user);
    vendaAbertaPara($user, $ana);

    expect(Venda::query()->orderBy('id')->pluck('cliente_id')->all())
        ->toBe([Cliente::consumidorId(), $ana->id]);
});

it('nao aceita cliente de outra empresa na venda', function (): void {
    $user = User::factory()->create();
    $alheio = clienteDe(User::factory()->create());
    $produto = Produto::query()->create(['nome' => 'Café', 'preco_compra' => 2, 'preco_venda' => 6.5, 'usuario_id' => $user->id]);

    $this->actingAs($user)->post(route('vendas.store'), [
        'cliente_id' => $alheio->id,
        'itens' => [['produto_id' => $produto->id, 'quantidade' => 1, 'valor_unitario' => 6.5]],
    ])->assertSessionHasErrors(['cliente_id' => 'Cliente não encontrado.']);
});

it('busca vendas pelo nome do cliente', function (): void {
    $user = User::factory()->create();
    vendaAbertaPara($user, clienteDe($user, ['nome' => 'Juliana Reis']));
    vendaAbertaPara($user);

    $this->actingAs($user)
        ->get(route('vendas', ['busca' => 'juliana']))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('vendas.data', 1)
                ->where('vendas.data.0.cliente.nome', 'Juliana Reis')
            )
        );
});
