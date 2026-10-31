<?php

use App\Models\EmpresaModulo;
use App\Models\Segmento;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config([
        'admin.emails' => ['admin@horizonte.test'],
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);
});

function administradorDeEmpresas(): User
{
    $admin = User::factory()->create(['email' => 'admin@horizonte.test']);
    $admin->empresa()->update(['nome' => 'AAA Horizonte']);

    return $admin;
}

it('lista as empresas com admin master, segmento e modulos', function () {
    $admin = administradorDeEmpresas();
    $cliente = User::factory()->google()->restaurante()->create(['email' => 'bistro@gmail.com']);
    $cliente->empresa()->update(['nome' => 'Bistrô']);

    $this->actingAs($admin)
        ->get(route('admin.empresas'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/empresas/index')
            ->has('segmentos', 2)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('empresas', 2)
                ->where('empresas.1.nome', 'Bistrô')
                ->where('empresas.1.segmento', 'Restaurante')
                ->where('empresas.1.modulos', [Segmento::MODULO_MENU_BOARD, Segmento::MODULO_COPILOTO])
                ->where('empresas.1.admin_master.email', 'bistro@gmail.com')
                ->where('empresas.1.admin_master.conta_google', true)
                ->where('empresas.1.ajustes', ['menu_board' => 'herdar', 'copiloto' => 'herdar'])));
});

it('filtra as empresas por segmento e busca', function () {
    $admin = administradorDeEmpresas();
    $cliente = User::factory()->restaurante()->create(['email' => 'maria@email.com']);
    $cliente->empresa()->update(['nome' => 'Cantina da Maria']);
    $restauranteId = Segmento::query()->where('chave', Segmento::RESTAURANTE)->value('id');

    $this->actingAs($admin)
        ->get(route('admin.empresas', ['segmento_id' => $restauranteId]))
        ->assertInertia(fn (Assert $page) => $page->loadDeferredProps(fn (Assert $reload) => $reload->has('empresas', 1)->where('empresas.0.nome', 'Cantina da Maria')));

    $this->actingAs($admin)
        ->get(route('admin.empresas', ['busca' => 'maria@']))
        ->assertInertia(fn (Assert $page) => $page->loadDeferredProps(fn (Assert $reload) => $reload->has('empresas', 1)));
});

it('troca o segmento e grava os ajustes de modulo da empresa', function () {
    $cliente = User::factory()->create();
    $empresa = $cliente->empresa();
    $restauranteId = Segmento::query()->where('chave', Segmento::RESTAURANTE)->value('id');

    $this->actingAs(administradorDeEmpresas())
        ->put(route('admin.empresas.update', $empresa->id), [
            'segmento_id' => $restauranteId,
            'ajustes' => ['menu_board' => 'herdar', 'copiloto' => 'desligar'],
        ])
        ->assertRedirect();

    $empresa = $empresa->fresh();
    expect($empresa->segmento_id)->toBe($restauranteId)
        ->and($empresa->podeUsar(Segmento::MODULO_MENU_BOARD))->toBeTrue()
        ->and($empresa->podeUsar(Segmento::MODULO_COPILOTO))->toBeFalse()
        ->and(EmpresaModulo::query()->where('empresa_id', $empresa->id)->count())->toBe(1);
});

it('volta a herdar do segmento quando o ajuste e removido', function () {
    $cliente = User::factory()->create();
    $empresa = $cliente->empresa();
    EmpresaModulo::query()->create(['empresa_id' => $empresa->id, 'modulo' => 'copiloto', 'ligado' => false]);

    $this->actingAs(administradorDeEmpresas())->put(route('admin.empresas.update', $empresa->id), [
        'segmento_id' => $empresa->segmento_id,
        'ajustes' => ['copiloto' => 'herdar'],
    ]);

    expect(EmpresaModulo::query()->where('empresa_id', $empresa->id)->exists())->toBeFalse()
        ->and($empresa->fresh()->podeUsar(Segmento::MODULO_COPILOTO))->toBeTrue();
});

it('recusa modulo desconhecido e estado invalido no ajuste', function () {
    $empresa = User::factory()->create()->empresa();

    $this->actingAs(administradorDeEmpresas())
        ->put(route('admin.empresas.update', $empresa->id), [
            'segmento_id' => $empresa->segmento_id,
            'ajustes' => ['vendas' => 'desligar', 'copiloto' => 'talvez'],
        ])
        ->assertSessionHasErrors(['ajustes', 'ajustes.copiloto']);
});

it('responde 404 nas empresas para quem nao e administrador', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.empresas'))->assertNotFound();
    $this->actingAs($user)->put(route('admin.empresas.update', $user->empresa()->id), ['segmento_id' => 1])->assertNotFound();
});
