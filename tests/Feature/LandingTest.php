<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('mostra a landing page para visitante', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('landing/index')
            ->where('links.entrar', route('login'))
            ->where('links.criarConta', route('register')));
});

it('manda o usuário logado direto para o início', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('home'))
        ->assertRedirect(route('inicio'));
});

it('liga o ssr só na landing page', function () {
    $this->get(route('login'))->assertOk();
    expect(config('inertia.ssr.enabled'))->toBeFalse();

    $this->get(route('home'))->assertOk();
    expect(config('inertia.ssr.enabled'))->toBeTrue();
});
