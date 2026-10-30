<?php

use App\Models\Grupo;
use App\Models\MenuBoard;
use App\Models\MenuBoardItem;
use App\Models\MenuBoardPagina;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();

    config([
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);
});

function produtoDoUsuario(User $user, string $nome = 'Parmegiana', array $atributos = []): Produto
{
    return Produto::query()->create([
        'nome' => $nome,
        'preco_compra' => 10,
        'preco_venda' => 39.9,
        'usuario_id' => $user->id,
        ...$atributos,
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

/**
 * @param  array<string, mixed>  $configuracao
 * @param  list<array{0: Produto, 1: bool}>  $itens
 */
function paginaNoBoard(MenuBoard $board, string $layout = MenuBoardPagina::LAYOUT_DESTAQUES_GRADE, array $configuracao = [], array $itens = [], array $atributos = []): MenuBoardPagina
{
    $pagina = MenuBoardPagina::query()->create([
        'menu_board_id' => $board->id,
        'ordem' => $board->paginas()->count(),
        'nome' => 'Página',
        'layout' => $layout,
        'duracao_segundos' => 15,
        'configuracao' => $configuracao,
        ...$atributos,
    ]);

    foreach ($itens as $ordem => [$produto, $destaque]) {
        MenuBoardItem::query()->create(['menu_board_pagina_id' => $pagina->id, 'produto_id' => $produto->id, 'destaque' => $destaque, 'ordem' => $ordem]);
    }

    return $pagina;
}

/**
 * @param  array<string, mixed>  $dados
 * @return array<string, mixed>
 */
function paginaEnviada(string $layout, array $dados = []): array
{
    return ['nome' => 'Página', 'layout' => $layout, 'duracao_segundos' => 15, 'configuracao' => [], 'itens' => [], ...$dados];
}

it('cria menu board com as paginas e os itens na ordem enviada', function (): void {
    $user = User::factory()->create();
    $frango = produtoDoUsuario($user, 'Frango');
    $suco = produtoDoUsuario($user, 'Suco');

    $this->actingAs($user)
        ->post(route('menu-boards.store'), [
            'nome' => 'Menu Almoço',
            'tema' => 'rustico',
            'paginas' => [
                paginaEnviada(MenuBoardPagina::LAYOUT_DESTAQUES_GRADE, [
                    'nome' => 'Destaques do dia',
                    'duracao_segundos' => 20,
                    'configuracao' => ['fonte' => 'manual'],
                    'itens' => [
                        ['produto_id' => $suco->id, 'destaque' => false],
                        ['produto_id' => $frango->id, 'destaque' => true],
                    ],
                ]),
                paginaEnviada(MenuBoardPagina::LAYOUT_AVISO, [
                    'nome' => 'Avalie a gente',
                    'configuracao' => ['titulo' => 'Gostou?', 'qr_ativo' => true, 'qr_link' => 'https://g.page/r/abc/review'],
                ]),
            ],
        ])
        ->assertRedirect(route('menu-boards'))
        ->assertSessionHas('success');

    $board = MenuBoard::query()->with('paginas.itens')->sole();
    [$destaques, $aviso] = $board->paginas->all();

    expect($board->usuario_id)->toBe($user->id)
        ->and($board->tema)->toBe('rustico')
        ->and($board->ativo)->toBeFalse()
        ->and($board->paginas->pluck('nome')->all())->toBe(['Destaques do dia', 'Avalie a gente'])
        ->and($destaques->duracao_segundos)->toBe(20)
        ->and($destaques->itens->pluck('produto_id')->all())->toBe([$suco->id, $frango->id])
        ->and($destaques->itens->pluck('destaque')->all())->toBe([false, true])
        ->and($aviso->config('qr_link'))->toBe('https://g.page/r/abc/review')
        ->and($aviso->itens)->toBeEmpty();
});

it('guarda so a configuracao e os itens que o layout usa', function (): void {
    $user = User::factory()->create();
    $produto = produtoDoUsuario($user);
    $outro = produtoDoUsuario($user, 'Outro');

    $this->actingAs($user)
        ->post(route('menu-boards.store'), [
            'nome' => 'Menu',
            'tema' => 'dark',
            'paginas' => [
                paginaEnviada(MenuBoardPagina::LAYOUT_PRODUTO_DESTAQUE, [
                    'configuracao' => ['selo' => 'Mais pedido', 'titulo' => 'Não pertence a este layout'],
                    'itens' => [['produto_id' => $produto->id], ['produto_id' => $outro->id]],
                ]),
            ],
        ])
        ->assertSessionHasNoErrors();

    $pagina = MenuBoardPagina::query()->with('itens')->sole();

    expect($pagina->configuracao)->toBe(['selo' => 'Mais pedido', 'chamada' => null, 'mostrar_descricao' => false, 'foto_posicao' => 'direita'])
        ->and($pagina->itens->pluck('produto_id')->all())->toBe([$produto->id]);
});

it('recusa produto de outro usuario no menu board', function (): void {
    $user = User::factory()->create();
    $alheio = produtoDoUsuario(User::factory()->create(), 'Produto alheio');

    $this->actingAs($user)
        ->post(route('menu-boards.store'), [
            'nome' => 'Menu Almoço',
            'tema' => 'dark',
            'paginas' => [paginaEnviada(MenuBoardPagina::LAYOUT_DESTAQUES_GRADE, ['itens' => [['produto_id' => $alheio->id, 'destaque' => false]]])],
        ])
        ->assertSessionHasErrors('paginas.0.itens.0.produto_id');

    expect(MenuBoard::query()->count())->toBe(0);
});

it('recusa tema desconhecido', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('menu-boards.store'), ['nome' => 'Menu', 'tema' => 'neon', 'paginas' => []])
        ->assertSessionHasErrors('tema');
});

it('valida o conteudo obrigatorio de cada layout', function (array $pagina, string $campo): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('menu-boards.store'), ['nome' => 'Menu', 'tema' => 'dark', 'paginas' => [$pagina]])
        ->assertSessionHasErrors("paginas.0.{$campo}");

    expect(MenuBoard::query()->count())->toBe(0);
})->with([
    'tempo curto demais' => [paginaEnviada(MenuBoardPagina::LAYOUT_AVISO, ['duracao_segundos' => 2, 'configuracao' => ['titulo' => 'Oi']]), 'duracao_segundos'],
    'aviso sem titulo' => [paginaEnviada(MenuBoardPagina::LAYOUT_AVISO), 'configuracao.titulo'],
    'qr ligado sem link' => [paginaEnviada(MenuBoardPagina::LAYOUT_AVISO, ['configuracao' => ['titulo' => 'Oi', 'qr_ativo' => true]]), 'configuracao.qr_link'],
    'qr com link sem https' => [paginaEnviada(MenuBoardPagina::LAYOUT_AVISO, ['configuracao' => ['titulo' => 'Oi', 'qr_ativo' => true, 'qr_link' => 'http://site.com']]), 'configuracao.qr_link'],
    'categoria sem grupo' => [paginaEnviada(MenuBoardPagina::LAYOUT_CATEGORIA), 'configuracao.grupo_id'],
    'banner sem imagem' => [paginaEnviada(MenuBoardPagina::LAYOUT_BANNER), 'imagem'],
    'produto em destaque sem produto' => [paginaEnviada(MenuBoardPagina::LAYOUT_PRODUTO_DESTAQUE), 'itens'],
]);

it('recusa mais de tres destaques na mesma pagina', function (): void {
    $user = User::factory()->create();
    $itens = collect(range(1, 4))->map(fn (int $n) => ['produto_id' => produtoDoUsuario($user, "Produto {$n}")->id, 'destaque' => true])->all();

    $this->actingAs($user)
        ->post(route('menu-boards.store'), [
            'nome' => 'Menu',
            'tema' => 'dark',
            'paginas' => [paginaEnviada(MenuBoardPagina::LAYOUT_DESTAQUES_GRADE, ['itens' => $itens])],
        ])
        ->assertSessionHasErrors('paginas.0.itens');
});

it('aceita grupo do usuario e recusa grupo de outro usuario', function (): void {
    $user = User::factory()->create();
    $doUsuario = Grupo::query()->create(['nome' => 'Bebidas', 'usuario_id' => $user->id]);
    $alheio = Grupo::query()->create(['nome' => 'Alheio', 'usuario_id' => User::factory()->create()->id]);
    $enviar = fn (Grupo $grupo) => $this->actingAs($user)->post(route('menu-boards.store'), [
        'nome' => 'Menu',
        'tema' => 'dark',
        'paginas' => [paginaEnviada(MenuBoardPagina::LAYOUT_CATEGORIA, ['configuracao' => ['grupo_id' => $grupo->id]])],
    ]);

    $enviar($alheio)->assertSessionHasErrors('paginas.0.configuracao.grupo_id');
    $enviar($doUsuario)->assertSessionHasNoErrors();

    expect(MenuBoardPagina::query()->sole()->config('grupo_id'))->toBe($doUsuario->id);
});

it('atualiza menu board substituindo as paginas', function (): void {
    $user = User::factory()->create();
    $board = boardDoUsuario($user);
    paginaNoBoard($board, itens: [[produtoDoUsuario($user, 'Antigo'), true]]);
    $novo = produtoDoUsuario($user, 'Novo');

    $this->actingAs($user)
        ->put(route('menu-boards.update', $board->id), [
            'nome' => 'Promocional de Sexta',
            'tema' => 'vibrante',
            'paginas' => [paginaEnviada(MenuBoardPagina::LAYOUT_PRODUTO_DESTAQUE, ['itens' => [['produto_id' => $novo->id]]])],
        ])
        ->assertRedirect(route('menu-boards'));

    $board->refresh()->load('paginas.itens');

    expect($board->nome)->toBe('Promocional de Sexta')
        ->and($board->tema)->toBe('vibrante')
        ->and($board->paginas)->toHaveCount(1)
        ->and($board->paginas->first()->layout)->toBe(MenuBoardPagina::LAYOUT_PRODUTO_DESTAQUE)
        ->and($board->paginas->first()->itens->pluck('produto_id')->all())->toBe([$novo->id])
        ->and(MenuBoardItem::query()->count())->toBe(1);
});

it('salva a imagem da pagina, mantem a atual e apaga a que saiu do board', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('menu-boards.store'), [
        'nome' => 'Menu',
        'tema' => 'dark',
        'paginas' => [paginaEnviada(MenuBoardPagina::LAYOUT_BANNER, ['imagem' => UploadedFile::fake()->image('pix.jpg', 1920, 1080)])],
    ])->assertSessionHasNoErrors();

    $board = MenuBoard::query()->sole();
    $caminho = MenuBoardPagina::query()->sole()->imagem_path;
    Storage::disk('public')->assertExists($caminho);

    $this->actingAs($user)->put(route('menu-boards.update', $board->id), [
        'nome' => 'Menu',
        'tema' => 'dark',
        'paginas' => [
            paginaEnviada(MenuBoardPagina::LAYOUT_BANNER, ['imagem_atual' => $caminho]),
            paginaEnviada(MenuBoardPagina::LAYOUT_AVISO, ['configuracao' => ['titulo' => 'Oi']]),
        ],
    ])->assertSessionHasNoErrors();

    expect(MenuBoardPagina::query()->where('layout', MenuBoardPagina::LAYOUT_BANNER)->sole()->imagem_path)->toBe($caminho);
    Storage::disk('public')->assertExists($caminho);

    $this->actingAs($user)->put(route('menu-boards.update', $board->id), [
        'nome' => 'Menu',
        'tema' => 'dark',
        'paginas' => [paginaEnviada(MenuBoardPagina::LAYOUT_AVISO, ['configuracao' => ['titulo' => 'Oi']])],
    ])->assertSessionHasNoErrors();

    Storage::disk('public')->assertMissing($caminho);
});

it('nao deixa uma pagina apontar para a imagem de outro board', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();
    $board = boardDoUsuario($user);
    $alheio = paginaNoBoard(boardDoUsuario(User::factory()->create()), MenuBoardPagina::LAYOUT_BANNER, atributos: ['imagem_path' => 'menu-boards/99/alheia.jpg']);

    $this->actingAs($user)->put(route('menu-boards.update', $board->id), [
        'nome' => 'Menu',
        'tema' => 'dark',
        'paginas' => [paginaEnviada(MenuBoardPagina::LAYOUT_BANNER, ['imagem_atual' => $alheio->imagem_path])],
    ]);

    expect($board->paginas()->value('imagem_path'))->toBeNull();
});

it('nao altera nem exclui menu board de outro usuario', function (): void {
    $user = User::factory()->create();
    $board = boardDoUsuario(User::factory()->create());

    $this->actingAs($user)
        ->put(route('menu-boards.update', $board->id), ['nome' => 'Invadido', 'tema' => 'dark', 'paginas' => []])
        ->assertNotFound();

    $this->actingAs($user)
        ->delete(route('menu-boards.destroy', $board->id))
        ->assertNotFound();

    $this->actingAs($user)
        ->post(route('menu-boards.ativar', $board->id))
        ->assertNotFound();

    expect($board->fresh()->nome)->toBe('Menu Almoço');
});

it('exclui menu board do usuario junto com as imagens das paginas', function (): void {
    Storage::fake('public');
    Storage::disk('public')->put('menu-boards/1/banner.jpg', 'imagem');
    $user = User::factory()->create();
    $board = boardDoUsuario($user);
    paginaNoBoard($board, MenuBoardPagina::LAYOUT_BANNER, atributos: ['imagem_path' => 'menu-boards/1/banner.jpg']);

    $this->actingAs($user)
        ->delete(route('menu-boards.destroy', $board->id))
        ->assertRedirect(route('menu-boards'));

    expect(MenuBoard::query()->find($board->id))->toBeNull()
        ->and(MenuBoardPagina::query()->count())->toBe(0);
    Storage::disk('public')->assertMissing('menu-boards/1/banner.jpg');
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

it('lista apenas os boards do usuario com as paginas e o tempo do ciclo', function (): void {
    $user = User::factory()->create();
    $board = boardDoUsuario($user);
    paginaNoBoard($board, atributos: ['nome' => 'Destaques', 'duracao_segundos' => 20]);
    paginaNoBoard($board, MenuBoardPagina::LAYOUT_AVISO, atributos: ['nome' => 'Avalie', 'duracao_segundos' => 15]);
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
                ->where('boards.0.paginas_count', 2)
                ->where('boards.0.ciclo_segundos', 35)
                ->where('boards.0.paginas.1.layout', MenuBoardPagina::LAYOUT_AVISO)
            )
        );
});

it('abre o editor so com produtos ativos e sem itens de produtos desativados', function (): void {
    $user = User::factory()->create();
    $board = boardDoUsuario($user);
    $ativo = produtoDoUsuario($user, 'Ativo');
    $inativo = produtoDoUsuario($user, 'Inativo', ['ativo' => false]);
    paginaNoBoard($board, itens: [[$ativo, false], [$inativo, false]]);
    produtoDoUsuario(User::factory()->create(), 'Alheio');

    $this->actingAs($user)
        ->get(route('menu-boards.edit', $board->id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('menu-boards/form')
            ->where('board.nome', 'Menu Almoço')
            ->has('board.paginas', 1)
            ->has('board.paginas.0.itens', 1)
            ->where('board.paginas.0.itens.0.produto_id', $ativo->id)
            ->has('produtos', 1)
            ->where('produtos.0.nome', 'Ativo')
        );
});
