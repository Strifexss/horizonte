<?php

use App\Http\Controllers\TvController;
use App\Models\Grupo;
use App\Models\MenuBoard;
use App\Models\MenuBoardItem;
use App\Models\MenuBoardPagina;
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

/**
 * @param  array<string, mixed>  $configuracao
 * @param  list<array{0: Produto, 1: bool}>  $itens
 */
function paginaDaTv(MenuBoard $board, string $layout, array $configuracao = [], array $itens = [], int $duracao = 15): MenuBoardPagina
{
    $pagina = MenuBoardPagina::query()->create([
        'menu_board_id' => $board->id,
        'ordem' => $board->paginas()->count(),
        'nome' => 'Página',
        'layout' => $layout,
        'duracao_segundos' => $duracao,
        'configuracao' => $configuracao,
    ]);

    foreach ($itens as $ordem => [$produto, $destaque]) {
        MenuBoardItem::query()->create(['menu_board_pagina_id' => $pagina->id, 'produto_id' => $produto->id, 'destaque' => $destaque, 'ordem' => $ordem]);
    }

    return $pagina;
}

function boardAtivoNaTv(User $user): MenuBoard
{
    tvPareada($user);

    return MenuBoard::query()->create(['nome' => 'Menu Almoço', 'tema' => 'dark', 'ativo' => true, 'usuario_id' => $user->id]);
}

it('mostra a tela de pareamento para tv sem cookie', function (): void {
    $this->get(route('tv'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('tv/pareamento'));
});

it('mostra a tela de pareamento para tv desconectada', function (): void {
    tvPareada(User::factory()->restaurante()->create())->update(['revogado_em' => now()]);

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertInertia(fn (Assert $page) => $page->component('tv/pareamento'));
});

it('volta para a tela de pareamento depois que o usuario desconecta a tv', function (): void {
    $user = User::factory()->restaurante()->create();
    $dispositivo = tvPareada($user);

    $this->actingAs($user)->delete(route('tv.dispositivos.destroy', $dispositivo->id));

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertInertia(fn (Assert $page) => $page->component('tv/pareamento'));
});

it('exibe as paginas do board ativo com destaques separados e sem dados financeiros', function (): void {
    $user = User::factory()->restaurante()->create(['name' => 'Bistrô Sabor da Casa']);
    $board = boardAtivoNaTv($user);
    MenuBoard::query()->create(['nome' => 'Inativo', 'tema' => 'clean', 'ativo' => false, 'usuario_id' => $user->id]);
    $parmegiana = Produto::query()->create(['nome' => 'Parmegiana', 'descricao' => 'Arroz e fritas', 'preco_compra' => 15, 'preco_venda' => 39.9, 'usuario_id' => $user->id]);
    $suco = Produto::query()->create(['nome' => 'Suco', 'preco_compra' => 2, 'preco_venda' => 9.9, 'usuario_id' => $user->id]);
    $inativo = Produto::query()->create(['nome' => 'Fora do cardápio', 'preco_compra' => 1, 'preco_venda' => 5, 'ativo' => false, 'usuario_id' => $user->id]);
    paginaDaTv($board, MenuBoardPagina::LAYOUT_DESTAQUES_GRADE, ['fonte' => 'manual'], [[$suco, false], [$parmegiana, true], [$inativo, false]], duracao: 20);
    paginaDaTv($board, MenuBoardPagina::LAYOUT_AVISO, ['titulo' => 'Gostou?', 'texto' => 'Avalie', 'qr_ativo' => true, 'qr_link' => 'https://g.page/r/abc', 'qr_legenda' => 'Google']);

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tv/board')
            ->where('board.nome', 'Menu Almoço')
            ->where('board.tema', 'dark')
            ->missing('board.estabelecimento')
            ->has('board.paginas', 2)
            ->where('board.paginas.0.layout', MenuBoardPagina::LAYOUT_DESTAQUES_GRADE)
            ->where('board.paginas.0.duracao_segundos', 20)
            ->has('board.paginas.0.destaques', 1)
            ->where('board.paginas.0.destaques.0.nome', 'Parmegiana')
            ->where('board.paginas.0.destaques.0.descricao', 'Arroz e fritas')
            ->where('board.paginas.0.destaques.0.preco', '39.90')
            ->missing('board.paginas.0.destaques.0.preco_compra')
            ->has('board.paginas.0.itens', 1)
            ->where('board.paginas.0.itens.0.nome', 'Suco')
            ->where('board.paginas.1.titulo', 'Gostou?')
            ->where('board.paginas.1.qr.link', 'https://g.page/r/abc')
            ->missing('sincronizado_em')
        );
});

it('lista os produtos ativos do grupo na ordem escolhida e pode esconder os destaques da grade', function (): void {
    $user = User::factory()->restaurante()->create();
    $board = boardAtivoNaTv($user);
    $bebidas = Grupo::query()->create(['nome' => 'Bebidas', 'usuario_id' => $user->id]);
    $agua = Produto::query()->create(['nome' => 'Água', 'preco_compra' => 1, 'preco_venda' => 4.5, 'grupo_id' => $bebidas->id, 'usuario_id' => $user->id]);
    Produto::query()->create(['nome' => 'Refri', 'preco_compra' => 2, 'preco_venda' => 6.9, 'grupo_id' => $bebidas->id, 'usuario_id' => $user->id]);
    Produto::query()->create(['nome' => 'Suco', 'preco_compra' => 3, 'preco_venda' => 9.9, 'grupo_id' => $bebidas->id, 'usuario_id' => $user->id]);
    Produto::query()->create(['nome' => 'Chá desativado', 'preco_compra' => 1, 'preco_venda' => 1, 'grupo_id' => $bebidas->id, 'ativo' => false, 'usuario_id' => $user->id]);
    paginaDaTv($board, MenuBoardPagina::LAYOUT_CATEGORIA, ['grupo_id' => $bebidas->id, 'ordenacao' => 'maior_preco']);
    paginaDaTv($board, MenuBoardPagina::LAYOUT_DESTAQUES_GRADE, ['fonte' => 'categoria', 'grupo_id' => $bebidas->id, 'ordenacao' => 'nome', 'ocultar_destaques' => true], [[$agua, true]]);

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('board.paginas.0.titulo', 'Bebidas')
            ->where('board.paginas.0.itens.0.nome', 'Suco')
            ->where('board.paginas.0.itens.2.nome', 'Água')
            ->has('board.paginas.0.itens', 3)
            ->where('board.paginas.1.destaques.0.nome', 'Água')
            ->has('board.paginas.1.itens', 2)
            ->where('board.paginas.1.itens.0.nome', 'Refri')
        );
});

it('tira da tv as paginas que ficaram sem conteudo', function (): void {
    $user = User::factory()->restaurante()->create();
    $board = boardAtivoNaTv($user);
    $desativado = Produto::query()->create(['nome' => 'Saiu do cardápio', 'preco_compra' => 1, 'preco_venda' => 9, 'ativo' => false, 'usuario_id' => $user->id]);
    $vazio = Grupo::query()->create(['nome' => 'Vazio', 'usuario_id' => $user->id]);
    paginaDaTv($board, MenuBoardPagina::LAYOUT_PRODUTO_DESTAQUE, ['selo' => 'Mais pedido'], [[$desativado, false]]);
    paginaDaTv($board, MenuBoardPagina::LAYOUT_CATEGORIA, ['grupo_id' => $vazio->id]);
    paginaDaTv($board, MenuBoardPagina::LAYOUT_BANNER);
    paginaDaTv($board, MenuBoardPagina::LAYOUT_AVISO, ['titulo' => 'Aceitamos Pix']);

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('board.paginas', 1)
            ->where('board.paginas.0.layout', MenuBoardPagina::LAYOUT_AVISO)
            ->where('board.paginas.0.qr', null)
        );
});

it('mostra o produto em destaque com selo, chamada e descricao opcional', function (): void {
    $user = User::factory()->restaurante()->create();
    $board = boardAtivoNaTv($user);
    $burger = Produto::query()->create(['nome' => 'X-Burger', 'descricao' => 'Blend 180 g', 'preco_compra' => 10, 'preco_venda' => 32.9, 'usuario_id' => $user->id]);
    paginaDaTv($board, MenuBoardPagina::LAYOUT_PRODUTO_DESTAQUE, ['selo' => 'Mais pedido', 'chamada' => 'Feito na hora', 'mostrar_descricao' => false, 'foto_posicao' => 'esquerda'], [[$burger, false]]);

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('board.paginas.0.produto.nome', 'X-Burger')
            ->where('board.paginas.0.produto.descricao', null)
            ->where('board.paginas.0.produto.preco', '32.90')
            ->where('board.paginas.0.selo', 'Mais pedido')
            ->where('board.paginas.0.chamada', 'Feito na hora')
            ->where('board.paginas.0.foto_posicao', 'esquerda')
        );
});

it('exibe estado vazio quando o usuario nao tem board ativo', function (): void {
    tvPareada(User::factory()->restaurante()->create());

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('tv/board')
            ->where('board', null)
        );
});

it('registra o ultimo acesso da tv', function (): void {
    $dispositivo = tvPareada(User::factory()->restaurante()->create());

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')->get(route('tv'));

    expect($dispositivo->fresh()->ultimo_acesso_em)->not->toBeNull();
});
