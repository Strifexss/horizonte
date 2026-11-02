<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\FormaPagamento;
use App\Models\Grupo;
use App\Models\Produto;
use App\Models\User;
use App\Models\Venda;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

function formaPadraoId(string $nome): int
{
    return (int) FormaPagamento::query()->where('nome', $nome)->whereNull('usuario_id')->value('id');
}

function produtoParaVenda(User $user, array $atributos = []): Produto
{
    return Produto::query()->create([
        'nome' => 'Café Premium',
        'preco_compra' => 20,
        'preco_venda' => 45.90,
        'usuario_id' => $user->id,
        ...$atributos,
    ]);
}

function contaDoUsuario(User $user, array $atributos = []): Conta
{
    return Conta::query()->create([
        'nome' => 'Caixa',
        'usuario_id' => $user->id,
        ...$atributos,
    ]);
}

it('salva venda aberta quando os pagamentos nao cobrem o total, sem gerar receita', function (): void {
    $user = User::factory()->create();
    $cafe = produtoParaVenda($user);

    $this->actingAs($user)
        ->post(route('vendas.store'), [
            'itens' => [['produto_id' => $cafe->id, 'quantidade' => 3, 'valor_unitario' => 45.90]],
            'pagamentos' => [['forma_pagamento_id' => formaPadraoId('Pix'), 'valor' => 100]],
        ])
        ->assertRedirect(route('vendas'))
        ->assertSessionHas('success');

    $venda = Venda::query()->with('itens', 'pagamentos')->sole();

    expect($venda->status)->toBe(Venda::STATUS_ABERTA)
        ->and((float) $venda->total)->toBe(137.70)
        ->and($venda->usuario_id)->toBe($user->id)
        ->and((float) $venda->itens->sole()->valor_total)->toBe(137.70)
        ->and((float) $venda->pagamentos->sole()->valor)->toBe(100.0)
        ->and(Financeiro::query()->count())->toBe(0);
});

it('fecha a venda quando os pagamentos batem e gera uma receita por pagamento', function (): void {
    Carbon::setTestNow('2026-10-24 10:30:00');
    $user = User::factory()->create();
    contaDoUsuario($user, ['nome' => 'Secundária']);
    $contaPadrao = contaDoUsuario($user, ['nome' => 'Principal', 'padrao' => 1]);
    $cafe = produtoParaVenda($user);
    $pao = produtoParaVenda($user, ['nome' => 'Pão Francês', 'preco_venda' => 12.50]);

    $this->actingAs($user)
        ->post(route('vendas.store'), [
            'itens' => [
                ['produto_id' => $cafe->id, 'quantidade' => 3, 'valor_unitario' => 45.90],
                ['produto_id' => $pao->id, 'quantidade' => 1, 'valor_unitario' => 12.50],
            ],
            'pagamentos' => [
                ['forma_pagamento_id' => formaPadraoId('Pix'), 'valor' => 100.20],
                ['forma_pagamento_id' => formaPadraoId('Cartão de Crédito'), 'valor' => 50],
            ],
        ])
        ->assertSessionHas('success');

    $venda = Venda::query()->sole();
    $categoriaVenda = Categoria::query()->where('nome', Categoria::NOME_VENDA)->whereNull('usuario_id')->value('id');
    $parcelas = FinanceiroParcela::query()->with('financeiro')->orderBy('valor', 'desc')->get();

    expect($venda->status)->toBe(Venda::STATUS_FECHADA)
        ->and((float) $venda->total)->toBe(150.20)
        ->and($parcelas)->toHaveCount(2);

    [$pix, $credito] = $parcelas;

    expect($pix->descricao)->toBe("Venda #{$venda->id} - Pix")
        ->and((float) $pix->valor)->toBe(100.20)
        ->and((float) $pix->valor_pago)->toBe(100.20)
        ->and($pix->financeiro->tipo)->toBe('RECEITA')
        ->and($pix->financeiro->venda_id)->toBe($venda->id)
        ->and($pix->financeiro->forma_pagamento_id)->toBe(formaPadraoId('Pix'))
        ->and($pix->categoria_id)->toBe($categoriaVenda)
        ->and($pix->conta_id)->toBe($contaPadrao->id)
        ->and($pix->data_competencia->toDateString())->toBe('2026-10-24')
        ->and($pix->data_vencimento->toDateString())->toBe('2026-10-24')
        ->and((float) $credito->valor)->toBe(50.0)
        ->and((float) $credito->valor_pago)->toBe(0.0)
        ->and($credito->financeiro->forma_pagamento_id)->toBe(formaPadraoId('Cartão de Crédito'));
});

it('rejeita pagamentos acima do total', function (): void {
    $user = User::factory()->create();
    contaDoUsuario($user);
    $cafe = produtoParaVenda($user);

    $this->actingAs($user)
        ->from(route('vendas'))
        ->post(route('vendas.store'), [
            'itens' => [['produto_id' => $cafe->id, 'quantidade' => 1, 'valor_unitario' => 45.90]],
            'pagamentos' => [['forma_pagamento_id' => formaPadraoId('Espécie'), 'valor' => 50]],
        ])
        ->assertRedirect(route('vendas'))
        ->assertSessionHasErrors('pagamentos');

    expect(Venda::query()->count())->toBe(0);
});

it('nao fecha a venda sem conta cadastrada e nao grava nada', function (): void {
    $user = User::factory()->create();
    $cafe = produtoParaVenda($user);

    $this->actingAs($user)
        ->post(route('vendas.store'), [
            'itens' => [['produto_id' => $cafe->id, 'quantidade' => 1, 'valor_unitario' => 45.90]],
            'pagamentos' => [['forma_pagamento_id' => formaPadraoId('Pix'), 'valor' => 45.90]],
        ])
        ->assertSessionHasErrors('conta');

    expect(Venda::query()->count())->toBe(0)
        ->and(Financeiro::query()->count())->toBe(0);
});

it('volta para a tela de vendas ao cadastrar conta por ela', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('vendas'))
        ->post(route('contas.store'), ['nome' => 'Caixa', 'descricao' => '', 'padrao' => false])
        ->assertRedirect(route('vendas'));

    $this->actingAs($user)
        ->get(route('vendas'))
        ->assertInertia(fn (Assert $page) => $page->where('possui_conta', true));
});

it('cadastra forma de pagamento pela venda recarregando so as formas', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->from(route('vendas'))
        ->withHeaders([
            'X-Inertia' => 'true',
            'X-Inertia-Version' => (string) (new HandleInertiaRequests)->version(Request::create('/')),
            'X-Inertia-Partial-Component' => 'vendas/index',
            'X-Inertia-Partial-Data' => 'formas_pagamento,flash',
        ])
        ->followingRedirects()
        ->post(route('formas-pagamento.store'), ['nome' => 'Vale refeição'])
        ->assertOk();

    expect($response->json('component'))->toBe('vendas/index')
        ->and($response->json('props'))->not->toHaveKeys(['vendas', 'filters', 'possui_conta'])
        ->and($response->json('props.formas_pagamento.data'))->toHaveCount(5)
        ->and($response->json('props.formas_pagamento.data.4.nome'))->toBe('Vale refeição')
        ->and($response->json('props.flash.forma_pagamento_criada'))->toMatchArray([
            'nome' => 'Vale refeição',
            'ativo' => true,
            'padrao' => false,
        ]);
});

it('junta produto repetido, aceita quantidade decimal e guarda o preco do momento', function (): void {
    $user = User::factory()->create();
    $cafe = produtoParaVenda($user);

    $this->actingAs($user)
        ->post(route('vendas.store'), [
            'itens' => [
                ['produto_id' => $cafe->id, 'quantidade' => 1.5, 'valor_unitario' => 40],
                ['produto_id' => $cafe->id, 'quantidade' => 0.25, 'valor_unitario' => 99],
            ],
        ])
        ->assertSessionHasNoErrors();

    $cafe->update(['preco_venda' => 80]);
    $item = Venda::query()->sole()->itens()->sole();

    expect((float) $item->quantidade)->toBe(1.75)
        ->and((float) $item->valor_unitario)->toBe(40.0)
        ->and((float) $item->valor_total)->toBe(70.0);
});

it('valida itens, quantidade e valor da venda', function (array $itens, string $campo): void {
    $user = User::factory()->create();
    $cafe = produtoParaVenda($user);
    $itens = array_map(fn (array $item): array => ['produto_id' => $cafe->id, ...$item], $itens);

    $this->actingAs($user)
        ->post(route('vendas.store'), ['itens' => $itens])
        ->assertSessionHasErrors($campo);
})->with([
    'sem itens' => [[], 'itens'],
    'quantidade zero' => [[['quantidade' => 0, 'valor_unitario' => 10]], 'itens.0.quantidade'],
    'valor zero' => [[['quantidade' => 1, 'valor_unitario' => 0]], 'itens.0.valor_unitario'],
]);

it('nao aceita produto de outro usuario nem produto inativo numa venda nova', function (): void {
    $user = User::factory()->create();
    $alheio = produtoParaVenda(User::factory()->create());
    $inativo = produtoParaVenda($user, ['ativo' => false]);

    $this->actingAs($user)
        ->post(route('vendas.store'), [
            'itens' => [['produto_id' => $alheio->id, 'quantidade' => 1, 'valor_unitario' => 10]],
        ])
        ->assertSessionHasErrors('itens.0.produto_id');

    $this->actingAs($user)
        ->post(route('vendas.store'), [
            'itens' => [['produto_id' => $inativo->id, 'quantidade' => 1, 'valor_unitario' => 10]],
        ])
        ->assertSessionHasErrors('itens');

    expect(Venda::query()->count())->toBe(0);
});

it('mantem produto inativado que ja estava na venda aberta ao editar', function (): void {
    $user = User::factory()->create();
    $cafe = produtoParaVenda($user);

    $this->actingAs($user)->post(route('vendas.store'), [
        'itens' => [['produto_id' => $cafe->id, 'quantidade' => 1, 'valor_unitario' => 45.90]],
    ]);

    $venda = Venda::query()->sole();
    $cafe->update(['ativo' => false]);

    $this->actingAs($user)
        ->put(route('vendas.update', ['id' => $venda->id]), [
            'itens' => [['produto_id' => $cafe->id, 'quantidade' => 2, 'valor_unitario' => 45.90]],
        ])
        ->assertSessionHasNoErrors();

    expect((float) $venda->fresh()->total)->toBe(91.80);
});

it('fecha uma venda aberta ao completar os pagamentos na edicao', function (): void {
    $user = User::factory()->create();
    contaDoUsuario($user);
    $cafe = produtoParaVenda($user);
    $itens = [['produto_id' => $cafe->id, 'quantidade' => 1, 'valor_unitario' => 45.90]];

    $this->actingAs($user)->post(route('vendas.store'), ['itens' => $itens]);
    $venda = Venda::query()->sole();

    $this->actingAs($user)
        ->put(route('vendas.update', ['id' => $venda->id]), [
            'itens' => $itens,
            'pagamentos' => [['forma_pagamento_id' => formaPadraoId('Espécie'), 'valor' => 45.90]],
        ])
        ->assertSessionHasNoErrors();

    expect($venda->fresh()->status)->toBe(Venda::STATUS_FECHADA)
        ->and(Financeiro::query()->where('venda_id', $venda->id)->count())->toBe(1);
});

it('nao altera venda fechada', function (): void {
    $user = User::factory()->create();
    contaDoUsuario($user);
    $cafe = produtoParaVenda($user);
    $itens = [['produto_id' => $cafe->id, 'quantidade' => 1, 'valor_unitario' => 45.90]];

    $this->actingAs($user)->post(route('vendas.store'), [
        'itens' => $itens,
        'pagamentos' => [['forma_pagamento_id' => formaPadraoId('Pix'), 'valor' => 45.90]],
    ]);
    $venda = Venda::query()->sole();

    $this->actingAs($user)
        ->put(route('vendas.update', ['id' => $venda->id]), [
            'itens' => [['produto_id' => $cafe->id, 'quantidade' => 5, 'valor_unitario' => 45.90]],
        ])
        ->assertSessionHasErrors('venda');

    expect((float) $venda->fresh()->total)->toBe(45.90);
});

it('cancela venda fechada excluindo as receitas geradas', function (): void {
    $user = User::factory()->create();
    contaDoUsuario($user);
    $cafe = produtoParaVenda($user);

    $this->actingAs($user)->post(route('vendas.store'), [
        'itens' => [['produto_id' => $cafe->id, 'quantidade' => 1, 'valor_unitario' => 45.90]],
        'pagamentos' => [
            ['forma_pagamento_id' => formaPadraoId('Pix'), 'valor' => 20],
            ['forma_pagamento_id' => formaPadraoId('Espécie'), 'valor' => 25.90],
        ],
    ]);
    $venda = Venda::query()->sole();

    $this->actingAs($user)
        ->post(route('vendas.cancelar', ['id' => $venda->id]))
        ->assertRedirect(route('vendas'))
        ->assertSessionHas('success');

    expect($venda->fresh()->status)->toBe(Venda::STATUS_CANCELADA)
        ->and(Financeiro::query()->count())->toBe(0)
        ->and(FinanceiroParcela::query()->count())->toBe(0)
        ->and($venda->itens()->count())->toBe(1);
});

it('cancela venda aberta', function (): void {
    $user = User::factory()->create();
    $cafe = produtoParaVenda($user);

    $this->actingAs($user)->post(route('vendas.store'), [
        'itens' => [['produto_id' => $cafe->id, 'quantidade' => 1, 'valor_unitario' => 45.90]],
    ]);
    $venda = Venda::query()->sole();

    $this->actingAs($user)
        ->post(route('vendas.cancelar', ['id' => $venda->id]))
        ->assertSessionHas('success');

    expect($venda->fresh()->status)->toBe(Venda::STATUS_CANCELADA);
});

it('nao altera nem cancela venda de outro usuario', function (): void {
    $dono = User::factory()->create();
    $cafe = produtoParaVenda($dono);

    $this->actingAs($dono)->post(route('vendas.store'), [
        'itens' => [['produto_id' => $cafe->id, 'quantidade' => 1, 'valor_unitario' => 45.90]],
    ]);
    $venda = Venda::query()->sole();
    $intruso = User::factory()->create();

    $this->actingAs($intruso)
        ->post(route('vendas.cancelar', ['id' => $venda->id]))
        ->assertNotFound();

    $this->actingAs($intruso)
        ->put(route('vendas.update', ['id' => $venda->id]), [
            'itens' => [['produto_id' => produtoParaVenda($intruso)->id, 'quantidade' => 1, 'valor_unitario' => 1]],
        ])
        ->assertNotFound();

    expect($venda->fresh()->status)->toBe(Venda::STATUS_ABERTA);
});

it('lista as vendas do usuario filtrando por status e forma de pagamento', function (): void {
    $this->withoutVite();
    config(['inertia.testing.page_paths' => [resource_path('js/pages')]]);

    $user = User::factory()->create();
    contaDoUsuario($user);
    $cafe = produtoParaVenda($user);
    $item = [['produto_id' => $cafe->id, 'quantidade' => 1, 'valor_unitario' => 45.90]];

    $this->actingAs($user)->post(route('vendas.store'), ['itens' => $item]);
    $this->actingAs($user)->post(route('vendas.store'), [
        'itens' => $item,
        'pagamentos' => [['forma_pagamento_id' => formaPadraoId('Pix'), 'valor' => 45.90]],
    ]);
    $alheio = User::factory()->create();
    $this->actingAs($alheio)->post(route('vendas.store'), [
        'itens' => [['produto_id' => produtoParaVenda($alheio)->id, 'quantidade' => 1, 'valor_unitario' => 1]],
    ]);

    $this->actingAs($user)
        ->get(route('vendas', ['status' => 'fechada', 'forma_pagamento_id' => formaPadraoId('Pix')]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('vendas/index')
            ->where('possui_conta', true)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('vendas.data', 1)
                ->where('vendas.data.0.status', 'fechada')
                ->where('vendas.data.0.itens.0.produto.nome', 'Café Premium')
                ->where('vendas.data.0.pagamentos.0.forma_pagamento.nome', 'Pix')
            )
        );

    $this->actingAs($user)
        ->get(route('vendas'))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $reload) => $reload->has('vendas.data', 2))
        );
});

it('conta as vendas por status do periodo ignorando o status selecionado', function (): void {
    $this->withoutVite();
    config(['inertia.testing.page_paths' => [resource_path('js/pages')]]);

    $user = User::factory()->create();
    contaDoUsuario($user);
    $cafe = produtoParaVenda($user);
    $item = [['produto_id' => $cafe->id, 'quantidade' => 1, 'valor_unitario' => 45.90]];

    $this->actingAs($user)->post(route('vendas.store'), ['itens' => $item]);
    $this->actingAs($user)->post(route('vendas.store'), ['itens' => $item]);
    $this->actingAs($user)->post(route('vendas.store'), [
        'itens' => $item,
        'pagamentos' => [['forma_pagamento_id' => formaPadraoId('Pix'), 'valor' => 45.90]],
    ]);
    $this->actingAs($user)->post(route('vendas.cancelar', Venda::query()->where('usuario_id', $user->id)->value('id')));
    $alheio = User::factory()->create();
    $this->actingAs($alheio)->post(route('vendas.store'), [
        'itens' => [['produto_id' => produtoParaVenda($alheio)->id, 'quantidade' => 1, 'valor_unitario' => 1]],
    ]);

    $this->actingAs($user)
        ->get(route('vendas', ['status' => 'fechada']))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('vendas.data', 1)
                ->where('resumo.counts', ['todos' => 3, 'aberta' => 1, 'fechada' => 1, 'cancelada' => 1])
            )
        );

    $this->actingAs($user)
        ->get(route('vendas', ['data_inicio' => now()->addDay()->toDateString()]))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('resumo.counts', ['todos' => 0, 'aberta' => 0, 'fechada' => 0, 'cancelada' => 0])
            )
        );
});

it('busca vendas pelo codigo, pelo produto ou pela observacao', function (): void {
    $this->withoutVite();
    config(['inertia.testing.page_paths' => [resource_path('js/pages')]]);

    $user = User::factory()->create();
    $cafe = produtoParaVenda($user);
    $pao = produtoParaVenda($user, ['nome' => 'Pão de Queijo']);

    $this->actingAs($user)->post(route('vendas.store'), ['itens' => [['produto_id' => $cafe->id, 'quantidade' => 1, 'valor_unitario' => 45.90]]]);
    $this->actingAs($user)->post(route('vendas.store'), [
        'itens' => [['produto_id' => $pao->id, 'quantidade' => 2, 'valor_unitario' => 8.50]],
        'observacao' => 'Encomenda da Maria',
    ]);
    [$vendaCafe, $vendaPao] = Venda::query()->where('usuario_id', $user->id)->orderBy('id')->get();

    $buscar = fn (string $busca) => $this->actingAs($user)
        ->get(route('vendas', ['busca' => $busca]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.busca', $busca)
            ->loadDeferredProps(fn (Assert $reload) => $reload->has('vendas.data', 1))
        );

    $buscar("#{$vendaCafe->id}")->assertInertia(fn (Assert $page) => $page
        ->loadDeferredProps(fn (Assert $reload) => $reload->where('vendas.data.0.id', $vendaCafe->id))
    );
    $buscar('pao de')->assertInertia(fn (Assert $page) => $page
        ->loadDeferredProps(fn (Assert $reload) => $reload->where('vendas.data.0.id', $vendaPao->id))
    );
    $buscar('maria')->assertInertia(fn (Assert $page) => $page
        ->loadDeferredProps(fn (Assert $reload) => $reload
            ->where('vendas.data.0.id', $vendaPao->id)
            ->where('resumo.counts.todos', 1)
        )
    );
});

it('busca so produtos ativos do usuario com o preco de venda', function (): void {
    $user = User::factory()->create();
    produtoParaVenda($user);
    produtoParaVenda($user, ['nome' => 'Café Antigo', 'ativo' => false]);
    produtoParaVenda(User::factory()->create(), ['nome' => 'Café Alheio']);

    $this->actingAs($user)
        ->getJson(route('vendas.produtos', ['q' => 'cafe']))
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonFragment(['nome' => 'Café Premium', 'preco_venda' => '45.90']);
});

it('bloqueia exclusao de produto usado em venda', function (): void {
    $user = User::factory()->create();
    $cafe = produtoParaVenda($user);

    $this->actingAs($user)->post(route('vendas.store'), [
        'itens' => [['produto_id' => $cafe->id, 'quantidade' => 1, 'valor_unitario' => 45.90]],
    ]);

    $this->actingAs($user)
        ->delete(route('produtos.destroy', ['id' => $cafe->id]))
        ->assertSessionHas('error');

    expect(Produto::query()->whereKey($cafe->id)->exists())->toBeTrue();
});

it('busca produto pelo codigo trazendo o codigo exato primeiro', function (): void {
    $user = User::factory()->create();
    produtoParaVenda($user, ['nome' => 'Água com gás', 'codigo' => '178']);
    produtoParaVenda($user, ['nome' => 'Água', 'codigo' => '78']);

    $this->actingAs($user)
        ->getJson(route('vendas.produtos', ['q' => '78']))
        ->assertOk()
        ->assertJsonCount(2)
        ->assertJsonPath('0.codigo', '78')
        ->assertJsonPath('1.codigo', '178');
});

it('envia para a nova venda so os favoritos ativos da empresa', function (): void {
    $user = User::factory()->create();
    produtoParaVenda($user, ['favorito' => true]);
    produtoParaVenda($user, ['nome' => 'Pão', 'favorito' => false]);
    produtoParaVenda($user, ['nome' => 'Suco inativo', 'favorito' => true, 'ativo' => false]);
    produtoParaVenda(User::factory()->create(), ['nome' => 'Alheio', 'favorito' => true]);

    $this->actingAs($user)
        ->get(route('vendas'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('produtos_favoritos', 1)
            ->where('produtos_favoritos.0.nome', 'Café Premium')
        );
});

it('pagina o catalogo da venda com os ativos da empresa', function (): void {
    $user = User::factory()->create();
    foreach (range(1, 21) as $numero) {
        produtoParaVenda($user, ['nome' => sprintf('Produto %02d', $numero)]);
    }
    produtoParaVenda($user, ['nome' => 'Produto inativo', 'ativo' => false]);
    produtoParaVenda(User::factory()->create(), ['nome' => 'Produto alheio']);

    $this->actingAs($user)
        ->getJson(route('vendas.catalogo'))
        ->assertOk()
        ->assertJsonCount(20, 'data')
        ->assertJsonPath('data.0.nome', 'Produto 01')
        ->assertJsonPath('proxima_pagina', 2);

    $this->actingAs($user)
        ->getJson(route('vendas.catalogo', ['page' => 2]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.nome', 'Produto 21')
        ->assertJsonPath('proxima_pagina', null);
});

it('filtra o catalogo por favoritos ou grupo e a busca ignora a aba', function (): void {
    $user = User::factory()->create();
    $bebidas = Grupo::query()->create(['nome' => 'Bebidas', 'usuario_id' => $user->id]);
    produtoParaVenda($user, ['nome' => 'Café', 'favorito' => true]);
    produtoParaVenda($user, ['nome' => 'Suco', 'grupo_id' => $bebidas->id, 'codigo' => 'SUC']);

    $this->actingAs($user)
        ->getJson(route('vendas.catalogo', ['favoritos' => 1]))
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.nome', 'Café');

    $this->actingAs($user)
        ->getJson(route('vendas.catalogo', ['grupo_id' => $bebidas->id]))
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.nome', 'Suco')
        ->assertJsonPath('data.0.grupo', 'Bebidas');

    $this->actingAs($user)
        ->getJson(route('vendas.catalogo', ['favoritos' => 1, 'q' => 'suc']))
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.codigo', 'SUC');
});

it('envia os grupos da empresa e o cliente padrao para a tela de vendas', function (): void {
    $user = User::factory()->create();
    Grupo::query()->create(['nome' => 'Bebidas', 'usuario_id' => $user->id]);
    Grupo::query()->create(['nome' => 'Alheio', 'usuario_id' => User::factory()->create()->id]);

    $this->actingAs($user)
        ->get(route('vendas'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('grupos', 1)
            ->where('grupos.0.nome', 'Bebidas')
            ->where('cliente_padrao.nome', 'CONSUMIDOR')
        );
});

it('recusa item sem preco e grava o preco corrigido no cadastro so quando pedido', function (): void {
    $user = User::factory()->create();
    $semPreco = produtoParaVenda($user, ['nome' => 'Suco', 'preco_venda' => 0]);
    $outro = produtoParaVenda($user, ['nome' => 'Bolo', 'preco_venda' => 0]);

    $this->actingAs($user)->post(route('vendas.store'), [
        'itens' => [['produto_id' => $semPreco->id, 'quantidade' => 1, 'valor_unitario' => 0]],
    ])->assertSessionHasErrors(['itens.0.valor_unitario' => 'O valor unitário precisa ser maior que zero.']);

    $this->actingAs($user)->post(route('vendas.store'), [
        'atualizar_preco_produto_ids' => [$semPreco->id],
        'itens' => [
            ['produto_id' => $semPreco->id, 'quantidade' => 2, 'valor_unitario' => 9.9],
            ['produto_id' => $outro->id, 'quantidade' => 1, 'valor_unitario' => 7.5],
        ],
    ])->assertSessionHasNoErrors();

    expect((float) $semPreco->fresh()->preco_venda)->toBe(9.9)
        ->and((float) $outro->fresh()->preco_venda)->toBe(0.0);
});

it('nao atualiza preco de produto de outra empresa pela venda', function (): void {
    $user = User::factory()->create();
    $meu = produtoParaVenda($user, ['preco_venda' => 0]);
    $alheio = produtoParaVenda(User::factory()->create(), ['preco_venda' => 3]);

    $this->actingAs($user)->post(route('vendas.store'), [
        'atualizar_preco_produto_ids' => [$alheio->id],
        'itens' => [['produto_id' => $meu->id, 'quantidade' => 1, 'valor_unitario' => 5]],
    ])->assertSessionHasNoErrors();

    expect((float) $alheio->fresh()->preco_venda)->toBe(3.0);
});
