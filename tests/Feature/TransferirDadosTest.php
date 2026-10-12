<?php

use App\Models\Fornecedor;
use App\Models\Produto;
use App\Models\User;

beforeEach(function () {
    config(['admin.emails' => ['admin@horizonte.test']]);
});

it('duplica produtos e fornecedores do usuario origem para destino', function (): void {
    $admin = User::factory()->create(['email' => 'admin@horizonte.test']);
    $origem = User::factory()->create();
    $destino = User::factory()->create();

    $forn = Fornecedor::query()->create(['nome' => 'F1', 'usuario_id' => $origem->id]);
    Produto::query()->create(['nome' => 'P1', 'preco_compra' => 10.0, 'usuario_id' => $origem->id, 'fornecedor_id' => $forn->id]);
    Produto::query()->create(['nome' => 'P2', 'preco_compra' => 12.5, 'usuario_id' => $origem->id, 'fornecedor_id' => $forn->id]);

    $this->actingAs($admin)
        ->post(route('admin.usuarios.transfer'), [
            'origem_id' => $origem->id,
            'destino_id' => $destino->id,
            'modulos' => ['fornecedores', 'produtos'],
            'migrar_relacionamentos' => true,
            'confirmacao' => '1',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Fornecedor::query()->where('usuario_id', $destino->id)->count())->toBe(1);
    expect(Produto::query()->where('usuario_id', $destino->id)->count())->toBe(2);
});

it('sugere usuarios por nome ou e-mail no autocomplete', function (string $busca) {
    $admin = User::factory()->create(['name' => 'Administrador', 'email' => 'admin@horizonte.test']);
    $maria = User::factory()->create(['name' => 'Maria da Silva', 'email' => 'maria@email.com']);
    User::factory()->create(['name' => 'José Pereira', 'email' => 'jose@email.com']);

    $this->actingAs($admin)
        ->getJson(route('admin.usuarios.autocomplete', ['q' => $busca]))
        ->assertOk()
        ->assertExactJson([
            ['id' => $maria->id, 'nome' => 'Maria da Silva (maria@email.com)'],
        ]);
})->with([
    'parte do nome' => ['maria'],
    'parte do e-mail' => ['maria@'],
]);

it('retorna a quantidade de registros do usuario por modulo', function () {
    $admin = User::factory()->create(['email' => 'admin@horizonte.test']);
    $origem = User::factory()->create();
    $fornecedor = Fornecedor::query()->create(['nome' => 'F1', 'usuario_id' => $origem->id]);
    Produto::query()->create(['nome' => 'P1', 'preco_compra' => 10, 'usuario_id' => $origem->id, 'fornecedor_id' => $fornecedor->id]);
    Produto::query()->create(['nome' => 'P2', 'preco_compra' => 20, 'usuario_id' => $origem->id]);

    $this->actingAs($admin)
        ->getJson(route('admin.usuarios.transfer.counts', $origem->id))
        ->assertOk()
        ->assertExactJson(['produtos' => 2, 'fornecedores' => 1]);
});

it('rejeita transferencia com destino igual a origem', function () {
    $admin = User::factory()->create(['email' => 'admin@horizonte.test']);
    $origem = User::factory()->create();
    Produto::query()->create(['nome' => 'P1', 'preco_compra' => 10, 'usuario_id' => $origem->id]);

    $this->actingAs($admin)
        ->from(route('admin.usuarios'))
        ->post(route('admin.usuarios.transfer'), [
            'origem_id' => $origem->id,
            'destino_id' => $origem->id,
            'modulos' => ['produtos'],
            'confirmacao' => '1',
        ])
        ->assertRedirect(route('admin.usuarios'))
        ->assertSessionHasErrors(['destino_id' => 'O usuário de destino não pode ser igual ao de origem']);

    expect(Produto::query()->count())->toBe(1);
});
