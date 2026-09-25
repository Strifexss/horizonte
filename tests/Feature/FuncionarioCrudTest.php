<?php

use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\Funcionario;
use App\Models\User;

it('cria funcionario vinculado ao usuario autenticado', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('funcionarios.store'), [
            'nome' => 'João Silva',
            'salario' => 3500.5,
        ])
        ->assertRedirect(route('extrato.index'))
        ->assertSessionHas('success')
        ->assertSessionHas('funcionario_criado');

    $this->assertDatabaseHas('funcionario', [
        'nome' => 'João Silva',
        'usuario_id' => $user->id,
        'salario' => 3500.5,
    ]);
});

it('nao lista funcionarios de outro usuario no autocomplete', function () {
    $user = User::factory()->create();
    $outro = User::factory()->create();

    Funcionario::query()->create([
        'nome' => 'Meu Funcionário',
        'salario' => 1000,
        'usuario_id' => $user->id,
    ]);

    Funcionario::query()->create([
        'nome' => 'Funcionário Alheio',
        'salario' => 2000,
        'usuario_id' => $outro->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('funcionarios.autocomplete'))
        ->assertOk()
        ->assertJsonFragment(['nome' => 'Meu Funcionário'])
        ->assertJsonMissing(['nome' => 'Funcionário Alheio']);
});

it('ao excluir funcionario limpa funcionario_id nas parcelas', function () {
    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira',
        'usuario_id' => $user->id,
    ]);
    $categoria = Categoria::query()->create([
        'nome' => 'SALÁRIO',
        'padrao' => 1,
        'tipo' => 'despesa',
        'usuario_id' => null,
    ]);
    $funcionario = Funcionario::query()->create([
        'nome' => 'Maria',
        'salario' => 2800,
        'usuario_id' => $user->id,
    ]);
    $financeiro = Financeiro::query()->create([
        'descricao' => 'Salário - Maria',
        'valor' => 2800,
        'tipo' => 'DESPESA',
        'usuario_id' => $user->id,
    ]);
    $parcela = FinanceiroParcela::query()->create([
        'descricao' => 'Salário - Maria',
        'data_vencimento' => now()->toDateString(),
        'data_competencia' => now()->toDateString(),
        'valor' => 2800,
        'valor_pago' => 0,
        'parcela' => 1,
        'financeiro_id' => $financeiro->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'funcionario_id' => $funcionario->id,
        'usuario_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->delete(route('funcionarios.destroy', $funcionario->id))
        ->assertRedirect(route('extrato.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('funcionario', ['id' => $funcionario->id]);
    $this->assertDatabaseHas('financeiro_parcela', [
        'id' => $parcela->id,
        'funcionario_id' => null,
    ]);
});

it('persiste funcionario_id ao criar lancamento de despesa', function () {
    $user = User::factory()->create();
    $conta = Conta::query()->create([
        'nome' => 'Carteira',
        'usuario_id' => $user->id,
    ]);
    $categoria = Categoria::query()->create([
        'nome' => 'SALÁRIO',
        'padrao' => 1,
        'tipo' => 'despesa',
        'usuario_id' => null,
    ]);
    $funcionario = Funcionario::query()->create([
        'nome' => 'Carlos',
        'salario' => 4200,
        'usuario_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->post(route('extrato.store'), [
            'descricao' => 'Salário - Carlos',
            'valor' => 4200,
            'tipo' => 'DESPESA',
            'conta_id' => $conta->id,
            'categoria_id' => $categoria->id,
            'funcionario_id' => $funcionario->id,
            'data_vencimento' => '2026-09-25',
            'valor_pago' => 4200,
            'qtd_parcelas' => 1,
        ])
        ->assertRedirect(route('extrato.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('financeiro_parcela', [
        'descricao' => 'Salário - Carlos',
        'funcionario_id' => $funcionario->id,
        'categoria_id' => $categoria->id,
        'usuario_id' => $user->id,
    ]);
});
