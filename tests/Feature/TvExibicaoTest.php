<?php

use App\Http\Controllers\TvController;
use App\Models\MenuBoard;
use App\Models\MenuBoardItem;
use App\Models\Produto;
use App\Models\TvDispositivo;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();

    config([
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);
});

function tvPareada(User $user, string $token = 'token-da-tv'): TvDispositivo
{
    return TvDispositivo::query()->create([
        'usuario_id' => $user->id,
        'token_hash' => hash('sha256', $token),
    ]);
}

function itemNoBoard(MenuBoard $board, Produto $produto, bool $destaque, int $ordem): void
{
    MenuBoardItem::query()->create([
        'menu_board_id' => $board->id,
        'produto_id' => $produto->id,
        'destaque' => $destaque,
        'ordem' => $ordem,
    ]);
}

it('mostra a tela de pareamento para tv sem cookie', function (): void {
    $this->get(route('tv'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('tv/pareamento'));
});

it('mostra a tela de pareamento para tv desconectada', function (): void {
    tvPareada(User::factory()->create())->update(['revogado_em' => now()]);

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertInertia(fn (Assert $page) => $page->component('tv/pareamento'));
});

it('volta para a tela de pareamento depois que o usuario desconecta a tv', function (): void {
    $user = User::factory()->create();
    $dispositivo = tvPareada($user);

    $this->actingAs($user)->delete(route('tv.dispositivos.destroy', $dispositivo->id));

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertInertia(fn (Assert $page) => $page->component('tv/pareamento'));
});

it('exibe o board ativo com destaques separados e sem dados financeiros', function (): void {
    $user = User::factory()->create(['name' => 'Bistrô Sabor da Casa']);
    tvPareada($user);
    $board = MenuBoard::query()->create(['nome' => 'Menu Almoço', 'tema' => 'dark', 'ativo' => true, 'usuario_id' => $user->id]);
    MenuBoard::query()->create(['nome' => 'Inativo', 'tema' => 'clean', 'ativo' => false, 'usuario_id' => $user->id]);
    $parmegiana = Produto::query()->create(['nome' => 'Parmegiana', 'descricao' => 'Arroz e fritas', 'preco_compra' => 15, 'preco_venda' => 39.9, 'usuario_id' => $user->id]);
    $suco = Produto::query()->create(['nome' => 'Suco', 'preco_compra' => 2, 'preco_venda' => 9.9, 'usuario_id' => $user->id]);
    $inativo = Produto::query()->create(['nome' => 'Fora do cardápio', 'preco_compra' => 1, 'preco_venda' => 5, 'ativo' => false, 'usuario_id' => $user->id]);
    itemNoBoard($board, $suco, destaque: false, ordem: 0);
    itemNoBoard($board, $parmegiana, destaque: true, ordem: 1);
    itemNoBoard($board, $inativo, destaque: false, ordem: 2);

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tv/board')
            ->where('board.nome', 'Menu Almoço')
            ->where('board.tema', 'dark')
            ->where('board.estabelecimento', 'Bistrô Sabor da Casa')
            ->has('board.destaques', 1)
            ->where('board.destaques.0.nome', 'Parmegiana')
            ->where('board.destaques.0.descricao', 'Arroz e fritas')
            ->where('board.destaques.0.preco', '39.90')
            ->missing('board.destaques.0.preco_compra')
            ->has('board.itens', 1)
            ->where('board.itens.0.nome', 'Suco')
            ->has('sincronizado_em')
        );
});

it('exibe estado vazio quando o usuario nao tem board ativo', function (): void {
    tvPareada(User::factory()->create());

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('tv/board')
            ->where('board', null)
        );
});

it('registra o ultimo acesso da tv', function (): void {
    $dispositivo = tvPareada(User::factory()->create());

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')->get(route('tv'));

    expect($dispositivo->fresh()->ultimo_acesso_em)->not->toBeNull();
});
