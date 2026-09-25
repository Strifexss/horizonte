<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $padroes = [
            ['nome' => 'Receita', 'tipo' => 'receita'],
            ['nome' => 'Despesa', 'tipo' => 'despesa'],
            ['nome' => 'PRODUTO', 'tipo' => 'despesa'],
            ['nome' => 'SALÁRIO', 'tipo' => 'despesa'],
        ];

        foreach ($padroes as $padrao) {
            Categoria::query()->firstOrCreate(
                [
                    'nome' => $padrao['nome'],
                    'tipo' => $padrao['tipo'],
                    'padrao' => 1,
                    'usuario_id' => null,
                ],
                [
                    'nome' => $padrao['nome'],
                    'tipo' => $padrao['tipo'],
                    'padrao' => 1,
                    'usuario_id' => null,
                ]
            );
        }
    }
}
