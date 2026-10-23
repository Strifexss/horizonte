<?php

use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\Produto;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();

    config([
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);
});

it('redireciona visitante para o login na listagem de produtos', function (): void {
    $this->get(route('produtos'))
        ->assertRedirect(route('login'));
});

it('renderiza a listagem de produtos do usuario autenticado incluindo preco de venda zerado', function (): void {
    $user = User::factory()->create();
    $outro = User::factory()->create();

    Produto::query()->create([
        'nome' => 'Café',
        'preco_compra' => 10,
        'preco_venda' => 0,
        'usuario_id' => $user->id,
    ]);
    Produto::query()->create([
        'nome' => 'Alheio',
        'preco_compra' => 20,
        'usuario_id' => $outro->id,
    ]);

    $this->actingAs($user)
        ->get(route('produtos'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('produtos/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('produtos.data.0.nome', 'Café')
                ->where('produtos.data.0.preco_venda', '0.00')
                ->where('produtos.data.0.ativo', true)
                ->missing('produtos.data.0.em_uso')
                ->has('produtos.data', 1)
            )
        );
});

it('filtra a listagem de produtos pelo nome', function (): void {
    $user = User::factory()->create();

    Produto::query()->create([
        'nome' => 'Café especial',
        'preco_compra' => 10,
        'usuario_id' => $user->id,
    ]);
    Produto::query()->create([
        'nome' => 'Açúcar',
        'preco_compra' => 5,
        'usuario_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->get(route('produtos', ['busca' => 'Cafe']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('produtos/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('produtos.data.0.nome', 'Café especial')
                ->has('produtos.data', 1)
            )
        );
});

it('pagina a listagem de produtos', function (): void {
    $user = User::factory()->create();

    foreach (range(1, 21) as $indice) {
        Produto::query()->create([
            'nome' => sprintf('Produto %02d', $indice),
            'preco_compra' => 10,
            'usuario_id' => $user->id,
        ]);
    }

    $this->actingAs($user)
        ->get(route('produtos', ['per_page' => 10, 'page' => 2]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('produtos/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('produtos.data', 10)
                ->where('produtos.meta.current_page', 2)
                ->where('produtos.meta.total', 21)
            )
        );
});

it('grava preco_venda 0.00 e ativo quando o cadastro rapido omite os campos', function (): void {
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
        'preco_venda' => 0,
        'ativo' => 1,
    ]);
});

it('grava preco_venda informado na tela de produtos e volta para a listagem', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('produtos'))
        ->post(route('produtos.store'), [
            'nome' => 'Camiseta',
            'preco_compra' => 40,
            'preco_venda' => 79.9,
            'ativo' => true,
        ])
        ->assertRedirect(route('produtos'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('produto', [
        'nome' => 'Camiseta',
        'usuario_id' => $user->id,
        'preco_compra' => 40,
        'preco_venda' => 79.9,
        'ativo' => 1,
    ]);
});

it('rejeita preco_venda negativo', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('produtos'))
        ->post(route('produtos.store'), [
            'nome' => 'Camiseta',
            'preco_compra' => 40,
            'preco_venda' => -1,
        ])
        ->assertSessionHasErrors('preco_venda');
});

it('nao consulta uso na listagem e so bloqueia a exclusao quando o usuario confirma', function (): void {
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
        'preco_venda' => 120,
        'usuario_id' => $user->id,
    ]);
    $financeiro = Financeiro::query()->create([
        'descricao' => 'Compra mouse',
        'valor' => 80,
        'tipo' => 'DESPESA',
        'usuario_id' => $user->id,
    ]);
    FinanceiroParcela::query()->create([
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
        ->get(route('produtos'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('produtos/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('produtos.data.0.nome', 'Mouse')
                ->missing('produtos.data.0.em_uso')
            )
        );

    $this->actingAs($user)
        ->from(route('produtos'))
        ->delete(route('produtos.destroy', $produto->id))
        ->assertRedirect(route('produtos'))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('produto', ['id' => $produto->id]);
    $this->assertDatabaseHas('financeiro_parcela', [
        'produto_id' => $produto->id,
    ]);

    $this->actingAs($user)
        ->from(route('produtos'))
        ->put(route('produtos.update', $produto->id), [
            'nome' => 'Mouse',
            'preco_compra' => 80,
            'preco_venda' => 120,
            'ativo' => false,
        ])
        ->assertRedirect(route('produtos'))
        ->assertSessionHas('success');

    expect(Produto::query()->findOrFail($produto->id)->ativo)->toBeFalse();
});

it('exclui produto que nunca foi usado em parcela', function (): void {
    $user = User::factory()->create();
    $produto = Produto::query()->create([
        'nome' => 'Teclado',
        'preco_compra' => 150,
        'usuario_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->from(route('produtos'))
        ->delete(route('produtos.destroy', $produto->id))
        ->assertRedirect(route('produtos'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('produto', ['id' => $produto->id]);
});

it('nao permite excluir produto de outro usuario', function (): void {
    $user = User::factory()->create();
    $outro = User::factory()->create();
    $produto = Produto::query()->create([
        'nome' => 'Alheio',
        'preco_compra' => 10,
        'usuario_id' => $outro->id,
    ]);

    $this->actingAs($user)
        ->delete(route('produtos.destroy', $produto->id))
        ->assertNotFound();

    $this->assertDatabaseHas('produto', ['id' => $produto->id]);
});
