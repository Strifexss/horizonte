<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as GoogleUser;

function usuarioDoGoogle(string $id = '1234567890', string $email = 'maria@gmail.com', string $nome = 'Maria Souza'): GoogleUser
{
    return (new GoogleUser)->map(['id' => $id, 'email' => $email, 'name' => $nome]);
}

function googleRetorna(GoogleUser $usuario): void
{
    Socialite::shouldReceive('driver->user')->andReturn($usuario);
}

it('redireciona para o consentimento do google', function () {
    config(['services.google.client_id' => 'id', 'services.google.client_secret' => 'segredo']);

    $this->get(route('google.redirect'))
        ->assertRedirectContains('accounts.google.com');
});

it('cria a conta google no primeiro acesso e manda para o onboarding', function () {
    googleRetorna(usuarioDoGoogle());

    $this->get(route('google.callback'))->assertRedirect(route('dashboard'));

    $user = User::query()->where('google_id', '1234567890')->firstOrFail();
    expect($user->email)->toBe('maria@gmail.com')
        ->and($user->name)->toBe('Maria Souza')
        ->and($user->password)->toBeNull()
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->empresa())->toBeNull();
    $this->assertAuthenticatedAs($user);

    $this->get(route('dashboard'))->assertRedirect(route('onboarding'));
});

it('reaproveita a conta google nos acessos seguintes', function () {
    $existente = User::factory()->google()->create(['google_id' => '1234567890']);
    googleRetorna(usuarioDoGoogle());

    $this->get(route('google.callback'));

    $this->assertAuthenticatedAs($existente);
    expect(User::query()->where('google_id', '1234567890')->count())->toBe(1);
});

it('nao mexe na conta com senha de mesmo e-mail', function () {
    $comSenha = User::factory()->create(['email' => 'maria@gmail.com', 'name' => 'Maria da Senha']);
    googleRetorna(usuarioDoGoogle());

    $this->get(route('google.callback'));

    expect(auth()->id())->not->toBe($comSenha->id)
        ->and($comSenha->fresh()->google_id)->toBeNull()
        ->and($comSenha->fresh()->name)->toBe('Maria da Senha');
});

it('volta ao login com erro quando o google falha ou o usuario cancela', function () {
    Socialite::shouldReceive('driver->user')->andThrow(new RuntimeException('access_denied'));

    $this->get(route('google.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');

    $this->assertGuest();
    expect(User::query()->whereNotNull('google_id')->count())->toBe(0);
});
