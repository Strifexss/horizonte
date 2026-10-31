<?php

use App\Models\Segmento;
use App\Models\User;
use App\Modulos;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config([
        'admin.emails' => ['admin@horizonte.test'],
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);
});

function administradorDeSegmentos(): User
{
    return User::factory()->create(['email' => 'admin@horizonte.test']);
}

it('lista os segmentos com o catalogo de modulos para o administrador', function () {
    $this->actingAs(administradorDeSegmentos())
        ->get(route('admin.segmentos'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/segmentos/index')
            ->has('modulos_opcionais', 2)
            ->where('modulos_obrigatorios', Modulos::OBRIGATORIOS)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('segmentos', 2)
                ->where('segmentos.0.nome', 'Restaurante')
                ->where('segmentos.1.empresas_count', 1)));
});

it('cria segmento com chave gerada pelo nome', function () {
    $this->actingAs(administradorDeSegmentos())
        ->post(route('admin.segmentos.store'), ['nome' => 'Serviços', 'descricao' => 'Salão, oficina', 'modulos' => ['copiloto'], 'ativo' => true])
        ->assertRedirect(route('admin.segmentos'));

    $segmento = Segmento::query()->where('nome', 'Serviços')->firstOrFail();
    expect($segmento->chave)->toBe('servicos')
        ->and($segmento->modulos)->toBe(['copiloto'])
        ->and($segmento->ativo)->toBeTrue();
});

it('edita os modulos do segmento sem trocar a chave', function () {
    $restaurante = Segmento::query()->where('chave', Segmento::RESTAURANTE)->firstOrFail();

    $this->actingAs(administradorDeSegmentos())
        ->put(route('admin.segmentos.update', $restaurante->id), ['nome' => 'Food service', 'modulos' => ['menu_board'], 'ativo' => false])
        ->assertRedirect(route('admin.segmentos'));

    $restaurante->refresh();
    expect($restaurante->chave)->toBe(Segmento::RESTAURANTE)
        ->and($restaurante->nome)->toBe('Food service')
        ->and($restaurante->modulos)->toBe(['menu_board'])
        ->and($restaurante->ativo)->toBeFalse();
});

it('recusa modulo desconhecido e nome repetido', function () {
    $this->actingAs(administradorDeSegmentos())
        ->post(route('admin.segmentos.store'), ['nome' => 'Varejo', 'modulos' => ['vendas']])
        ->assertSessionHasErrors(['nome', 'modulos.0']);
});

it('nao exclui segmento com empresas, mas exclui o vazio', function () {
    $admin = administradorDeSegmentos();
    $varejo = Segmento::query()->where('chave', Segmento::VAREJO)->firstOrFail();
    $vazio = Segmento::factory()->create();

    $this->actingAs($admin)->delete(route('admin.segmentos.destroy', $varejo->id))->assertSessionHas('error');
    $this->actingAs($admin)->delete(route('admin.segmentos.destroy', $vazio->id))->assertSessionHas('success');

    $this->assertModelExists($varejo);
    $this->assertModelMissing($vazio);
});

it('responde 404 para quem nao e administrador', function () {
    $this->actingAs(User::factory()->create())->get(route('admin.segmentos'))->assertNotFound();
});

it('lista no onboarding so os segmentos ativos', function () {
    Segmento::factory()->inativo()->create(['nome' => 'Escondido']);
    $user = User::factory()->semEmpresa()->create();

    $this->actingAs($user)
        ->get(route('onboarding'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('segmentos', 2)
            ->where('segmentos.0.nome', 'Varejo')
            ->missing('segmentos.0.urls'));
});

it('recusa segmento inativo no onboarding', function () {
    $inativo = Segmento::factory()->inativo()->create();
    $user = User::factory()->semEmpresa()->create();

    $this->actingAs($user)
        ->post(route('onboarding.store'), ['nome' => 'Minha loja', 'segmento_id' => $inativo->id])
        ->assertSessionHasErrors('segmento_id');
});
