<?php

use App\Models\Categoria;
use App\Models\Conta;
use App\Models\FinanceiroParcela;
use App\Models\FormaPagamento;
use App\Models\Produto;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @return array{conta: Conta, categoria: Categoria}
 */
function cadastrosDoExtrato(User $user): array
{
    return [
        'conta' => Conta::query()->create(['nome' => 'Carteira', 'usuario_id' => $user->id]),
        'categoria' => Categoria::query()->create(['nome' => 'Luz', 'tipo' => 'despesa', 'usuario_id' => $user->id]),
    ];
}

/**
 * @return array<string, mixed>
 */
function lancamentoDoExtrato(array $cadastros, array $atributos = []): array
{
    return [
        'descricao' => 'Conta de luz',
        'valor' => 100,
        'tipo' => 'DESPESA',
        'conta_id' => $cadastros['conta']->id,
        'categoria_id' => $cadastros['categoria']->id,
        'data_vencimento' => '2026-10-10',
        'valor_pago' => 0,
        'qtd_parcelas' => 1,
        'forma_pagamento_id' => formaPagamentoEspecieId(),
        ...$atributos,
    ];
}

function parcelaDeVenda(User $user): FinanceiroParcela
{
    Conta::query()->create(['nome' => 'Caixa', 'usuario_id' => $user->id]);
    $produto = Produto::query()->create(['nome' => 'Café', 'preco_compra' => 1, 'preco_venda' => 30, 'usuario_id' => $user->id]);
    $cartao = FormaPagamento::query()->where('nome', 'Cartão de Crédito')->whereNull('usuario_id')->value('id');

    test()->actingAs($user)->post(route('vendas.store'), [
        'itens' => [['produto_id' => $produto->id, 'quantidade' => 1, 'valor_unitario' => 30]],
        'pagamentos' => [['forma_pagamento_id' => $cartao, 'valor' => 30]],
    ]);

    return FinanceiroParcela::query()->with('financeiro')->sole();
}

it('exige forma de pagamento ativa e visivel ao lancar no extrato', function (?int $formaId): void {
    $user = User::factory()->create();
    $cadastros = cadastrosDoExtrato($user);

    $this->actingAs($user)
        ->post(route('extrato.store'), lancamentoDoExtrato($cadastros, ['forma_pagamento_id' => $formaId]))
        ->assertSessionHasErrors('forma_pagamento_id');
})->with([
    'ausente' => fn (): ?int => null,
    'inativa' => fn (): int => FormaPagamento::query()->create(['nome' => 'Velha', 'ativo' => false, 'padrao' => 1])->id,
    'de outro usuario' => fn (): int => FormaPagamento::query()->create(['nome' => 'Alheia', 'usuario_id' => User::factory()->create()->id])->id,
]);

it('grava a forma de pagamento no lancamento e mostra na parcela', function (): void {
    $this->withoutVite();
    config(['inertia.testing.page_paths' => [resource_path('js/pages')]]);

    $user = User::factory()->create();
    $cadastros = cadastrosDoExtrato($user);
    $pix = FormaPagamento::query()->where('nome', 'Pix')->value('id');

    $this->actingAs($user)
        ->post(route('extrato.store'), lancamentoDoExtrato($cadastros, ['forma_pagamento_id' => $pix]))
        ->assertSessionHas('success');

    $this->actingAs($user)
        ->post(route('extrato.store'), lancamentoDoExtrato($cadastros, ['descricao' => 'Água']))
        ->assertSessionHas('success');

    $this->actingAs($user)
        ->get(route('extrato.index', ['data_inicio' => '2026-10-01', 'data_fim' => '2026-10-31', 'forma_pagamento_id' => $pix]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('parcelas.data', 1)
                ->where('parcelas.data.0.descricao', 'Conta de luz')
                ->where('parcelas.data.0.forma_pagamento.nome', 'Pix')
                ->where('parcelas.data.0.venda_id', null)
            )
        );
});

it('troca a forma de pagamento ao editar a parcela', function (): void {
    $user = User::factory()->create();
    $cadastros = cadastrosDoExtrato($user);
    $this->actingAs($user)->post(route('extrato.store'), lancamentoDoExtrato($cadastros));
    $parcela = FinanceiroParcela::query()->with('financeiro')->sole();
    $pix = FormaPagamento::query()->where('nome', 'Pix')->value('id');

    $this->actingAs($user)
        ->put(route('parcela.update', ['id' => $parcela->id]), [
            'descricao' => 'Conta de luz',
            'valor' => 100,
            'categoria_id' => $cadastros['categoria']->id,
            'forma_pagamento_id' => $pix,
        ])
        ->assertSessionHas('success');

    expect($parcela->financeiro->fresh()->forma_pagamento_id)->toBe($pix);
});

it('permite dar baixa na receita de venda pelo extrato', function (): void {
    $user = User::factory()->create();
    $parcela = parcelaDeVenda($user);

    $this->actingAs($user)
        ->put(route('parcela.update', ['id' => $parcela->id]), [
            'valor' => 30,
            'valor_pago' => 30,
            'descricao' => 'Outra descrição',
            'categoria_id' => $parcela->categoria_id,
            'forma_pagamento_id' => $parcela->financeiro->forma_pagamento_id,
        ])
        ->assertSessionHas('success');

    $parcela->refresh();

    expect((float) $parcela->valor_pago)->toBe(30.0)
        ->and($parcela->descricao)->not->toBe('Outra descrição');
});

it('bloqueia mudar valor ou forma da receita de venda pelo extrato', function (array $mudanca): void {
    $user = User::factory()->create();
    $parcela = parcelaDeVenda($user);

    $this->actingAs($user)
        ->put(route('parcela.update', ['id' => $parcela->id]), [
            'valor' => 30,
            'valor_pago' => 0,
            'categoria_id' => $parcela->categoria_id,
            'forma_pagamento_id' => $parcela->financeiro->forma_pagamento_id,
            ...$mudanca,
        ])
        ->assertSessionHas('error');

    $parcela->refresh();

    expect((float) $parcela->valor)->toBe(30.0)
        ->and($parcela->financeiro->fresh()->forma_pagamento_id)->toBe($parcela->financeiro->forma_pagamento_id);
})->with([
    'valor' => fn (): array => ['valor' => 10],
    'forma' => fn (): array => ['forma_pagamento_id' => formaPagamentoEspecieId()],
]);

it('bloqueia excluir a receita de venda pelo extrato', function (): void {
    $user = User::factory()->create();
    $parcela = parcelaDeVenda($user);

    $this->actingAs($user)
        ->delete(route('parcela.destroy', ['id' => $parcela->id]))
        ->assertSessionHas('error');

    expect(FinanceiroParcela::query()->whereKey($parcela->id)->exists())->toBeTrue();
});
