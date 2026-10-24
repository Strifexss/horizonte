<?php

use App\Models\NovidadeDispensada;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    config(['inertia.testing.page_paths' => [resource_path('js/pages')]]);
});

it('entrega como pendentes so as publicadas com pop-up que o usuario nao dispensou', function (): void {
    $usuario = User::factory()->create();
    $pendente = novidadePublicada(['titulo' => 'Pendente']);
    novidadePublicada(['titulo' => 'Sem pop-up', 'popup_automatico' => false]);
    novidade(['titulo' => 'Rascunho com pop-up', 'popup_automatico' => true]);
    $dispensada = novidadePublicada(['titulo' => 'Já dispensada']);
    NovidadeDispensada::query()->create(['usuario_id' => $usuario->id, 'novidade_id' => $dispensada->id, 'dispensada_em' => now()]);

    $this->actingAs($usuario)
        ->get(route('formas-pagamento'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('novidades_pendentes', 1)
            ->where('novidades_pendentes.0.id', $pendente->id)
            ->where('novidades_pendentes.0.urls.dispensar', route('novidades.dispensar', $pendente->id))
            ->missing('novidades')
        );
});

it('registra o dispensar e tira a novidade das pendentes do usuario', function (): void {
    $usuario = User::factory()->create();
    $novidade = novidadePublicada();
    $this->travelTo('2026-10-24 10:00:00');

    $this->actingAs($usuario)
        ->from(route('formas-pagamento'))
        ->post(route('novidades.dispensar', $novidade->id))
        ->assertRedirect(route('formas-pagamento'));

    $registro = NovidadeDispensada::query()->sole();
    expect($registro->usuario_id)->toBe($usuario->id)
        ->and($registro->novidade_id)->toBe($novidade->id)
        ->and($registro->dispensada_em->toDateTimeString())->toBe('2026-10-24 10:00:00');

    $this->actingAs($usuario)
        ->get(route('formas-pagamento'))
        ->assertInertia(fn (Assert $page) => $page->has('novidades_pendentes', 0));
});

it('mantem a novidade pendente para quem nao a dispensou', function (): void {
    $quemDispensou = User::factory()->create();
    $outro = User::factory()->create();
    $novidade = novidadePublicada();

    $this->actingAs($quemDispensou)->post(route('novidades.dispensar', $novidade->id));

    $this->actingAs($outro)
        ->get(route('formas-pagamento'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('novidades_pendentes', 1)
            ->where('novidades_pendentes.0.id', $novidade->id)
        );
});

it('mostra no historico as publicadas, inclusive as ja dispensadas', function (): void {
    $usuario = User::factory()->create();
    $this->travelTo('2026-10-01 09:00:00');
    $antiga = novidadePublicada(['titulo' => 'Antiga']);
    $this->travelTo('2026-10-10 09:00:00');
    $recente = novidadePublicada(['titulo' => 'Recente sem pop-up', 'popup_automatico' => false]);
    novidade(['titulo' => 'Rascunho']);

    $this->actingAs($usuario)->post(route('novidades.dispensar', $antiga->id));

    $this->actingAs($usuario)
        ->get(route('formas-pagamento'))
        ->assertInertia(fn (Assert $page) => $page
            ->reloadOnly('novidades', fn (Assert $reload) => $reload
                ->has('novidades', 2)
                ->where('novidades.0.id', $recente->id)
                ->where('novidades.0.dispensada', false)
                ->where('novidades.1.id', $antiga->id)
                ->where('novidades.1.dispensada', true)
            )
        );
});

it('nao duplica o registro ao dispensar de novo', function (): void {
    $usuario = User::factory()->create();
    $novidade = novidadePublicada();

    $this->actingAs($usuario)->post(route('novidades.dispensar', $novidade->id));
    $this->actingAs($usuario)->post(route('novidades.dispensar', $novidade->id))->assertRedirect();

    expect(NovidadeDispensada::query()->count())->toBe(1);
});

it('responde 404 ao dispensar novidade em rascunho', function (): void {
    $rascunho = novidade(['popup_automatico' => true]);

    $this->actingAs(User::factory()->create())
        ->post(route('novidades.dispensar', $rascunho->id))
        ->assertNotFound();

    expect(NovidadeDispensada::query()->count())->toBe(0);
});

it('manda o visitante sem login para o login ao dispensar', function (): void {
    $novidade = novidadePublicada();

    $this->post(route('novidades.dispensar', $novidade->id))
        ->assertRedirect(route('login'));

    expect(NovidadeDispensada::query()->count())->toBe(0);
});

it('nao entrega novidades para visitante sem login', function (): void {
    novidadePublicada();

    $this->get(route('login'))
        ->assertInertia(fn (Assert $page) => $page->where('novidades_pendentes', []));
});
