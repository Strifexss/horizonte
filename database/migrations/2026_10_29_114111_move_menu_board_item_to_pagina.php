<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Os itens deixam de pertencer ao board e passam a pertencer a uma página.
 * Cada board existente ganha uma página "Destaques + Grade" com os itens que já tinha.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_board_item', function (Blueprint $table) {
            $table->foreignId('menu_board_pagina_id')->nullable()->after('id')->constrained('menu_board_pagina')->cascadeOnDelete();
        });

        $agora = now();

        DB::table('menu_board')->orderBy('id')->each(function (object $board) use ($agora): void {
            $paginaId = DB::table('menu_board_pagina')->insertGetId([
                'menu_board_id' => $board->id,
                'ordem' => 0,
                'nome' => 'Cardápio',
                'layout' => 'destaques_grade',
                'duracao_segundos' => 15,
                'configuracao' => json_encode(['fonte' => 'manual']),
                'created_at' => $agora,
                'updated_at' => $agora,
            ]);

            DB::table('menu_board_item')->where('menu_board_id', $board->id)->update(['menu_board_pagina_id' => $paginaId]);
        });

        Schema::table('menu_board_item', function (Blueprint $table) {
            $table->dropUnique(['menu_board_id', 'produto_id']);
            $table->dropConstrainedForeignId('menu_board_id');
            $table->unique(['menu_board_pagina_id', 'produto_id']);
        });
    }

    public function down(): void
    {
        Schema::table('menu_board_item', function (Blueprint $table) {
            $table->foreignId('menu_board_id')->nullable()->after('id')->constrained('menu_board')->cascadeOnDelete();
        });

        DB::table('menu_board_pagina')->orderBy('id')->each(function (object $pagina): void {
            DB::table('menu_board_item')->where('menu_board_pagina_id', $pagina->id)->update(['menu_board_id' => $pagina->menu_board_id]);
        });

        Schema::table('menu_board_item', function (Blueprint $table) {
            $table->dropUnique(['menu_board_pagina_id', 'produto_id']);
            $table->dropConstrainedForeignId('menu_board_pagina_id');
            $table->unique(['menu_board_id', 'produto_id']);
        });
    }
};
