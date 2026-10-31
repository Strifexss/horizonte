<?php

use App\Ai\Agents\AnalistaDashboard;
use App\Http\Controllers\TvController;
use App\Models\DashboardAnalise;
use App\Models\EmpresaModulo;
use App\Models\MenuBoard;
use App\Models\Segmento;
use App\Models\TvDispositivo;
use App\Models\User;
use App\Modulos;
use App\Services\Interfaces\DashboardInsightsServiceInterface;
use App\Services\Interfaces\EmpresasServiceInterface;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    config(['inertia.testing.page_paths' => [resource_path('js/pages')]]);
});

function ajustarModulo(User $user, string $modulo, bool $ligado): void
{
    EmpresaModulo::query()->create(['empresa_id' => $user->empresa()->id, 'modulo' => $modulo, 'ligado' => $ligado]);
    $user->esquecerEmpresaAtiva();
}

it('cria os segmentos iniciais com os modulos opcionais de cada um', function () {
    expect(Segmento::query()->where('chave', Segmento::VAREJO)->first()->modulos)->toBe([Modulos::COPILOTO])
        ->and(Segmento::query()->where('chave', Segmento::RESTAURANTE)->first()->modulos)->toBe([Modulos::MENU_BOARD, Modulos::COPILOTO]);
});

it('consulta o modulo pela empresas service, na sessao ou na empresa informada', function (): void {
    $user = User::factory()->create();
    $service = app(EmpresasServiceInterface::class);

    expect($service->podeUsar(Modulos::COPILOTO, $user->empresa()))->toBeTrue()
        ->and($service->podeUsar(Modulos::MENU_BOARD, $user->empresa()))->toBeFalse()
        ->and($service->podeUsar(Modulos::COPILOTO))->toBeFalse();

    $this->actingAs($user);

    expect($service->podeUsar(Modulos::COPILOTO))->toBeTrue()
        ->and($service->podeUsar(Modulos::MENU_BOARD))->toBeFalse();
});

it('libera os modulos do segmento e sempre os obrigatorios', function () {
    $varejo = User::factory()->create()->empresa();
    $restaurante = User::factory()->restaurante()->create()->empresa();

    expect($varejo->podeUsar(Modulos::COPILOTO))->toBeTrue()
        ->and($varejo->podeUsar(Modulos::MENU_BOARD))->toBeFalse()
        ->and($varejo->podeUsar('vendas'))->toBeTrue()
        ->and($restaurante->podeUsar(Modulos::MENU_BOARD))->toBeTrue();
});

it('faz o ajuste da empresa valer por cima do segmento', function () {
    $varejo = User::factory()->create();
    $restaurante = User::factory()->restaurante()->create();

    ajustarModulo($varejo, Modulos::MENU_BOARD, true);
    ajustarModulo($restaurante, Modulos::MENU_BOARD, false);

    expect($varejo->empresa()->podeUsar(Modulos::MENU_BOARD))->toBeTrue()
        ->and($restaurante->empresa()->podeUsar(Modulos::MENU_BOARD))->toBeFalse();
});

it('compartilha o segmento e os modulos disponiveis da empresa', function () {
    $user = User::factory()->restaurante()->create();

    $this->actingAs($user)
        ->get(route('extrato.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('empresa.segmento', 'Restaurante')
            ->where('empresa.modulos', [Modulos::MENU_BOARD, Modulos::COPILOTO]));
});

it('esconde o menu board de empresa sem o modulo', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('menu-boards'))->assertNotFound();
    $this->actingAs($user)->post(route('menu-boards.store'), ['nome' => 'Menu', 'tema' => 'dark', 'paginas' => []])->assertNotFound();
    $this->actingAs($user)->post(route('tv.pin.store'))->assertNotFound();
});

it('mostra menu board indisponivel na tv da empresa que perdeu o modulo e devolve os boards ao religar', function () {
    $user = User::factory()->restaurante()->create();
    $board = MenuBoard::query()->create(['nome' => 'Almoço', 'tema' => 'dark', 'ativo' => true, 'usuario_id' => $user->id]);
    TvDispositivo::query()->create(['usuario_id' => $user->id, 'token_hash' => hash('sha256', 'token-da-tv')]);
    ajustarModulo($user, Modulos::MENU_BOARD, false);

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertInertia(fn (Assert $page) => $page->component('tv/board')->where('indisponivel', true)->where('board', null));

    EmpresaModulo::query()->delete();

    $this->withCookie(TvController::COOKIE_DISPOSITIVO, 'token-da-tv')
        ->get(route('tv'))
        ->assertInertia(fn (Assert $page) => $page->where('indisponivel', false)->where('board.nome', $board->nome));
});

it('bloqueia o copiloto para empresa sem o modulo', function () {
    $user = User::factory()->create();
    ajustarModulo($user, Modulos::COPILOTO, false);

    $this->actingAs($user)
        ->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => now()->month])
        ->assertNotFound();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->loadDeferredProps(fn (Assert $reload) => $reload)->missing('insights'));
});

it('encerra sem chamar a ia a analise na fila de empresa que perdeu o copiloto', function () {
    AnalistaDashboard::fake();
    $user = User::factory()->create();
    $analise = DashboardAnalise::query()->create([
        'usuario_id' => $user->id,
        'ano' => now()->year,
        'mes' => now()->month,
        'status' => DashboardAnalise::STATUS_PROCESSANDO,
        'hash_dados' => 'x',
        'pacote' => [],
    ]);
    ajustarModulo($user, Modulos::COPILOTO, false);

    app(DashboardInsightsServiceInterface::class)->processar($analise->id);

    expect($analise->fresh()->status)->toBe(DashboardAnalise::STATUS_FALHOU);
    AnalistaDashboard::assertNeverPrompted();
});
