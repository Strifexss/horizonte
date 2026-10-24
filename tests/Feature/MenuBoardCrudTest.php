<?php

use App\Models\MenuBoard;
use App\Models\MenuBoardItem;
use App\Models\Produto;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();

    config([
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);
});

function produtoDoUsuario(User $user, string $nome = 'Parmegiana'): Produto
{
    return Produto::query()->create([
        'nome' => $nome,
        'preco_compra' => 10,
        'preco_venda' => 39.9,
        'usuario_id' => $user->id,
    ]);
}

function boardDoUsuario(User $user, string $nome = 'Menu Almoço', bool $ativo = false): MenuBoard
{
    return MenuBoard::query()->create([
        'nome' => $nome,
        'tema' => 'dark',
        'ativo' => $ativo,
        'usuario_id' => $user->id,
    ]);
}

it('cria menu board com itens na ordem enviada', function (): void {
    $user = User::factory()->create();
    $frango = produtoDoUsuario($user, 'Frango');
    $suco = produtoDoUsuario($user, 'Suco');

    $this->actingAs($user)
        ->post(route('menu-boards.store'), [
            'nome' => 'Menu Almoço',
            'tema' => 'dark',
            'itens' => [
                ['produto_id' => $suco->id, 'destaque' => false],
                ['produto_id' => $frango->id, 'destaque' => true],
            ],
        ])
        ->assertRedirect(route('menu-boards'))
        ->assertSessionHas('success');

    $board = MenuBoard::query()->sole();

    expect($board->usuario_id)->toBe($user->id)
        ->and($board->ativo)->toBeFalse()
        ->and($board->itens->pluck('produto_id')->all())->toBe([$suco->id, $frango->id])
        ->and($board->itens->pluck('destaque')->all())->toBe([false, true]);
});

it('recusa produto de outro usuario no menu board', function (): void {
    $user = User::factory()->create();
    $alheio = produtoDoUsuario(User::factory()->create(), 'Produto alheio');

    $this->actingAs($user)
        ->post(route('menu-boards.store'), [
            'nome' => 'Menu Almoço',
            'tema' => 'dark',
            'itens' => [['produto_id' => $alheio->id, 'destaque' => false]],
        ])
        ->assertSessionHasErrors('itens.0.produto_id');

    expect(MenuBoard::query()->count())->toBe(0);
});

it('recusa tema desconhecido', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('menu-boards.store'), ['nome' => 'Menu', 'tema' => 'neon', 'itens' => []])
        ->assertSessionHasErrors('tema');
});

it('atualiza menu board substituindo os itens', function (): void {
    $user = User::factory()->create();
    $board = boardDoUsuario($user);
    $antigo = produtoDoUsuario($user, 'Antigo');
    $novo = produtoDoUsuario($user, 'Novo');
    MenuBoardItem::query()->create(['menu_board_id' => $board->id, 'produto_id' => $antigo->id, 'destaque' => true, 'ordem' => 0]);

    $this->actingAs($user)
        ->put(route('menu-boards.update', $board->id), [
            'nome' => 'Promocional de Sexta',
            'tema' => 'vibrante',
            'itens' => [['produto_id' => $novo->id, 'destaque' => false]],
        ])
        ->assertRedirect(route('menu-boards'));

    $board->refresh();

    expect($board->nome)->toBe('Promocional de Sexta')
        ->and($board->tema)->toBe('vibrante')
        ->and($board->itens->pluck('produto_id')->all())->toBe([$novo->id]);
});

it('nao altera nem exclui menu board de outro usuario', function (): void {
    $user = User::factory()->create();
    $board = boardDoUsuario(User::factory()->create());

    $this->actingAs($user)
        ->put(route('menu-boards.update', $board->id), ['nome' => 'Invadido', 'tema' => 'dark', 'itens' => []])
        ->assertNotFound();

    $this->actingAs($user)
        ->delete(route('menu-boards.destroy', $board->id))
        ->assertNotFound();

    $this->actingAs($user)
        ->post(route('menu-boards.ativar', $board->id))
        ->assertNotFound();

    expect($board->fresh()->nome)->toBe('Menu Almoço');
});

it('exclui menu board do usuario', function (): void {
    $user = User::factory()->create();
    $board = boardDoUsuario($user);

    $this->actingAs($user)
        ->delete(route('menu-boards.destroy', $board->id))
        ->assertRedirect(route('menu-boards'));

    expect(MenuBoard::query()->find($board->id))->toBeNull();
});

it('ativa um board e desativa o anterior do mesmo usuario', function (): void {
    $user = User::factory()->create();
    $anterior = boardDoUsuario($user, 'Menu Almoço', ativo: true);
    $novo = boardDoUsuario($user, 'Promocional de Sexta');
    $deOutro = boardDoUsuario(User::factory()->create(), 'Board alheio', ativo: true);

    $this->actingAs($user)
        ->post(route('menu-boards.ativar', $novo->id))
        ->assertSessionHas('success');

    expect($novo->fresh()->ativo)->toBeTrue()
        ->and($anterior->fresh()->ativo)->toBeFalse()
        ->and($deOutro->fresh()->ativo)->toBeTrue();
});

it('lista apenas os boards do usuario com contagem de itens e destaques', function (): void {
    $user = User::factory()->create();
    $board = boardDoUsuario($user);
    MenuBoardItem::query()->create(['menu_board_id' => $board->id, 'produto_id' => produtoDoUsuario($user, 'A')->id, 'destaque' => true, 'ordem' => 0]);
    MenuBoardItem::query()->create(['menu_board_id' => $board->id, 'produto_id' => produtoDoUsuario($user, 'B')->id, 'destaque' => false, 'ordem' => 1]);
    boardDoUsuario(User::factory()->create(), 'Board alheio');

    $this->actingAs($user)
        ->get(route('menu-boards'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('menu-boards/index')
            ->where('pareamento.url', route('tv'))
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('boards', 1)
                ->where('boards.0.nome', 'Menu Almoço')
                ->where('boards.0.itens_count', 2)
                ->where('boards.0.destaques_count', 1)
            )
        );
});

it('abre o editor apenas com produtos ativos do usuario', function (): void {
    $user = User::factory()->create();
    $board = boardDoUsuario($user);
    produtoDoUsuario($user, 'Ativo');
    Produto::query()->create(['nome' => 'Inativo', 'preco_compra' => 1, 'ativo' => false, 'usuario_id' => $user->id]);
    produtoDoUsuario(User::factory()->create(), 'Alheio');

    $this->actingAs($user)
        ->get(route('menu-boards.edit', $board->id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('menu-boards/form')
            ->where('board.nome', 'Menu Almoço')
            ->has('produtos', 1)
            ->where('produtos.0.nome', 'Ativo')
        );
});
