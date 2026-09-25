<?php

use App\Models\Categoria;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $padroes = [
            ['nome' => 'Receita', 'tipo' => 'receita'],
            ['nome' => 'Despesa', 'tipo' => 'despesa'],
            ['nome' => 'PRODUTO', 'tipo' => 'despesa'],
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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Categoria::query()
            ->where('padrao', 1)
            ->whereNull('usuario_id')
            ->whereIn('nome', ['Receita', 'Despesa', 'PRODUTO'])
            ->delete();
    }
};
