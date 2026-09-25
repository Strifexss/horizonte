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
        Categoria::query()->firstOrCreate(
            [
                'nome' => 'PRODUTO',
                'tipo' => 'despesa',
                'padrao' => 1,
                'usuario_id' => null,
            ],
            [
                'nome' => 'PRODUTO',
                'tipo' => 'despesa',
                'padrao' => 1,
                'usuario_id' => null,
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Categoria::query()
            ->where('nome', 'PRODUTO')
            ->where('padrao', 1)
            ->whereNull('usuario_id')
            ->delete();
    }
};
