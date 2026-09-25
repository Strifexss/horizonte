<?php

use App\Models\Categoria;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Categoria::query()->firstOrCreate(
            [
                'nome' => 'SALÁRIO',
                'tipo' => 'despesa',
                'padrao' => 1,
                'usuario_id' => null,
            ],
            [
                'nome' => 'SALÁRIO',
                'tipo' => 'despesa',
                'padrao' => 1,
                'usuario_id' => null,
            ]
        );
    }

    public function down(): void
    {
        Categoria::query()
            ->where('nome', 'SALÁRIO')
            ->where('padrao', 1)
            ->whereNull('usuario_id')
            ->delete();
    }
};
