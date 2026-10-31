<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Segmentos iniciais; o Administrador edita ou cria outros no painel.
     */
    public function up(): void
    {
        $agora = now();

        DB::table('segmentos')->insert([
            [
                'chave' => 'varejo',
                'nome' => 'Varejo',
                'descricao' => 'Loja, mercado, comércio em geral',
                'modulos' => json_encode(['copiloto']),
                'ativo' => true,
                'created_at' => $agora,
                'updated_at' => $agora,
            ],
            [
                'chave' => 'restaurante',
                'nome' => 'Restaurante',
                'descricao' => 'Restaurante, lanchonete, padaria. Inclui Menu Board.',
                'modulos' => json_encode(['menu_board', 'copiloto']),
                'ativo' => true,
                'created_at' => $agora,
                'updated_at' => $agora,
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('segmentos')->whereIn('chave', ['varejo', 'restaurante'])->delete();
    }
};
