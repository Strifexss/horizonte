<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categoria;

class CategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Categorias padrão sem usuario_id
        Categoria::create([
            'nome' => 'Receita',
            'padrao' => 1,
            'tipo' => 'receita',
            'usuario_id' => null,
        ]);

        Categoria::create([
            'nome' => 'Despesa',
            'padrao' => 1,
            'tipo' => 'despesa',
            'usuario_id' => null,
        ]);
    }
}

