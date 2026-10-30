<?php

use App\Models\Empresa;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config(['inertia.testing.page_paths' => [resource_path('js/pages')]]);
});

it('cria empresa nao confirmada como admin master para cada usuario antigo na migracao', function () {
    $antigo = User::factory()->semEmpresa()->create(['name' => 'João Silva']);
    $migracao = require database_path('migrations/2026_10_30_200002_criar_empresas_para_usuarios_existentes.php');

    $migracao->up();

    $empresa = $antigo->fresh()->empresa();
    expect($empresa->nome)->toBe('Empresa de João Silva')
        ->and($empresa->nomeConfirmado())->toBeFalse()
        ->and($empresa->modulo)->toBe(Empresa::MODULO_VAREJO)
        ->and($antigo->empresas()->first()->pivot->cargo)->toBe(Empresa::CARGO_ADMIN_MASTER);
});

it('manda conta sem empresa para o onboarding', function () {
    $user = User::factory()->semEmpresa()->create();

    $this->actingAs($user)->get(route('dashboard'))->assertRedirect(route('onboarding'));
    $this->actingAs($user)->get(route('extrato.index'))->assertRedirect(route('onboarding'));
    $this->actingAs($user)
        ->get(route('onboarding'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('onboarding/index'));
});

it('cria a empresa no onboarding e libera o sistema', function () {
    $user = User::factory()->semEmpresa()->create();

    $this->actingAs($user)
        ->post(route('onboarding.store'), ['nome' => 'Padaria Bom Dia', 'modulo' => 'restaurante'])
        ->assertRedirect(route('dashboard'));

    $empresa = $user->fresh()->empresa();
    expect($empresa->nome)->toBe('Padaria Bom Dia')
        ->and($empresa->modulo)->toBe(Empresa::MODULO_RESTAURANTE)
        ->and($empresa->nomeConfirmado())->toBeTrue()
        ->and($user->empresas()->first()->pivot->cargo)->toBe(Empresa::CARGO_ADMIN_MASTER);

    $this->actingAs($user->fresh())->get(route('extrato.index'))->assertOk();
});

it('valida nome e ramo no onboarding', function () {
    $user = User::factory()->semEmpresa()->create();

    $this->actingAs($user)
        ->post(route('onboarding.store'), ['nome' => '', 'modulo' => 'oficina'])
        ->assertSessionHasErrors(['nome', 'modulo']);

    expect($user->fresh()->empresa())->toBeNull();
});

it('nao repete o onboarding para quem ja tem empresa', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('onboarding'))->assertRedirect(route('dashboard'));
    $this->actingAs($user)->post(route('onboarding.store'), ['nome' => 'Outra', 'modulo' => 'varejo'])->assertRedirect(route('dashboard'));

    expect($user->empresas()->count())->toBe(1);
});

it('compartilha a empresa ativa com o nome ainda nao confirmado para o modal', function () {
    $user = User::factory()->create();
    $user->empresa()->update(['nome' => 'Empresa de Maria', 'nome_confirmado_em' => null]);

    $this->actingAs($user)
        ->get(route('extrato.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('empresa.nome', 'Empresa de Maria')
            ->where('empresa.nome_confirmado', false));
});

it('confirma o nome oficial da empresa', function () {
    $user = User::factory()->create();
    $empresa = $user->empresa();
    $empresa->update(['nome' => 'Empresa de Maria', 'nome_confirmado_em' => null]);

    $this->actingAs($user)
        ->put(route('empresa.nome.update'), ['nome' => 'Mercadinho Sol'])
        ->assertRedirect();

    expect($empresa->fresh()->nome)->toBe('Mercadinho Sol')
        ->and($empresa->fresh()->nomeConfirmado())->toBeTrue();
});

it('valida o nome da empresa e nao mexe em empresa alheia', function () {
    $user = User::factory()->create();
    $outro = User::factory()->create();
    $empresaAlheia = $outro->empresa();

    $this->actingAs($user)
        ->put(route('empresa.nome.update'), ['nome' => ''])
        ->assertSessionHasErrors('nome');

    $this->actingAs($user)->put(route('empresa.nome.update'), ['nome' => 'Minha']);

    expect($empresaAlheia->fresh()->nome)->not->toBe('Minha');
});
