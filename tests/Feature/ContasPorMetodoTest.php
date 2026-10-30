<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

it('permite conta google e conta com senha com o mesmo e-mail', function () {
    User::factory()->create(['email' => 'joao@email.com']);
    User::factory()->google()->create(['email' => 'joao@email.com']);

    expect(User::query()->where('email', 'joao@email.com')->count())->toBe(2);
});

it('recusa cadastro com e-mail de outra conta com senha, mas aceita se so existir conta google', function () {
    User::factory()->create(['email' => 'senha@email.com']);
    User::factory()->google()->create(['email' => 'google@email.com']);
    $dados = ['name' => 'Fulano', 'password' => 'password', 'password_confirmation' => 'password'];

    $this->post(route('register'), [...$dados, 'email' => 'senha@email.com'])->assertSessionHasErrors('email');
    $this->assertGuest();

    $this->post(route('register'), [...$dados, 'email' => 'google@email.com'])->assertRedirect(route('dashboard'));
    $this->assertAuthenticated();
});

it('entra com senha so na conta com senha', function () {
    $google = User::factory()->google()->create(['email' => 'joao@email.com']);
    $comSenha = User::factory()->create(['email' => 'joao@email.com']);

    $this->post(route('login'), ['email' => 'joao@email.com', 'password' => 'password']);

    $this->assertAuthenticatedAs($comSenha);
    expect(auth()->id())->not->toBe($google->id);
});

it('nao entra com senha em conta google', function () {
    User::factory()->google()->create(['email' => 'so-google@email.com']);

    $this->post(route('login'), ['email' => 'so-google@email.com', 'password' => 'password'])->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('envia redefinicao de senha so para a conta com senha', function () {
    Notification::fake();
    $google = User::factory()->google()->create(['email' => 'joao@email.com']);
    $comSenha = User::factory()->create(['email' => 'joao@email.com']);
    User::factory()->google()->create(['email' => 'so-google@email.com']);

    $this->post(route('password.email'), ['email' => 'joao@email.com']);
    $this->post(route('password.email'), ['email' => 'so-google@email.com']);

    Notification::assertSentTo($comSenha, ResetPassword::class);
    Notification::assertSentToTimes($google, ResetPassword::class, 0);
    Notification::assertSentTimes(ResetPassword::class, 1);
});

it('esconde a troca de senha da conta google', function () {
    $google = User::factory()->google()->create();

    $this->actingAs($google)->get(route('password.edit'))->assertNotFound();
    $this->actingAs($google)->put(route('password.update'), ['password' => 'nova-senha-123', 'password_confirmation' => 'nova-senha-123'])->assertNotFound();
});

it('nao deixa a conta google trocar o e-mail', function () {
    $google = User::factory()->google()->create(['email' => 'original@gmail.com']);

    $this->actingAs($google)->patch(route('profile.update'), ['name' => 'Novo Nome', 'email' => 'outro@email.com']);

    expect($google->fresh()->email)->toBe('original@gmail.com')
        ->and($google->fresh()->name)->toBe('Novo Nome');
});

it('exclui a conta google sem pedir senha e leva a empresa junto', function () {
    $google = User::factory()->google()->create();
    $empresaId = $google->empresa()->id;

    $this->actingAs($google)->delete(route('profile.destroy'))->assertRedirect('/');

    $this->assertModelMissing($google);
    $this->assertDatabaseMissing('empresas', ['id' => $empresaId]);
});
