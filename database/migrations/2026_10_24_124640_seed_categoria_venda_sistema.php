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
                'nome' => Categoria::NOME_VENDA,
                'tipo' => 'receita',
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
            ->where('nome', Categoria::NOME_VENDA)
            ->where('padrao', 1)
            ->whereNull('usuario_id')
            ->delete();
    }
};
