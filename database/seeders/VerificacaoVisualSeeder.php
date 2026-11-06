<?php

namespace Database\Seeders;

use App\Models\Produto;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Usuário e dados mínimos para a verificação visual com Playwright (`tests/visual/`).
 * Só para banco local: não rode em produção.
 */
class VerificacaoVisualSeeder extends Seeder
{
    public const EMAIL = 'visual@horizonte.test';

    public const SENHA = 'senha-visual';

    public function run(): void
    {
        $usuario = User::query()->where('email', self::EMAIL)->first()
            ?? User::factory()->create([
                'name' => 'Verificação Visual',
                'email' => self::EMAIL,
                'password' => self::SENHA,
            ]);

        Produto::query()->firstOrCreate(
            ['usuario_id' => $usuario->id, 'nome' => 'X-Burger da Casa'],
            ['preco_compra' => 14.2, 'preco_venda' => 32.9],
        );
    }
}
