<?php

use App\Models\User;

test('mensagens de validação do cadastro saem em português', function () {
    $response = $this->post('/register', [
        'name' => '',
        'email' => 'invalido',
        'password' => 'password',
        'password_confirmation' => 'outra',
    ]);

    $response->assertSessionHasErrors([
        'name' => 'O campo nome é obrigatório.',
        'email' => 'O campo e-mail deve ser um e-mail válido.',
        'password' => 'A confirmação do campo senha não confere.',
    ]);
});

test('falha de login sai em português', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'senha-errada',
    ]);

    $response->assertSessionHasErrors([
        'email' => 'Essas credenciais não correspondem aos nossos registros.',
    ]);
});
