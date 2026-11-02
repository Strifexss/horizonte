<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Código comercial por Empresa (nunca o id) e atalho de favorito na venda.
     * Produtos existentes recebem código sequencial por Empresa, na ordem de cadastro.
     */
    public function up(): void
    {
        Schema::table('produto', function (Blueprint $table) {
            $table->string('codigo', 50)->nullable()->after('nome');
            $table->boolean('favorito')->default(false)->after('ativo');
        });

        $proximoPorEmpresa = [];

        DB::table('produto')
            ->orderBy('id')
            ->select(['id', 'empresa_id'])
            ->chunk(500, function ($produtos) use (&$proximoPorEmpresa): void {
                foreach ($produtos as $produto) {
                    $chave = (string) $produto->empresa_id;
                    $proximoPorEmpresa[$chave] = ($proximoPorEmpresa[$chave] ?? 0) + 1;

                    DB::table('produto')
                        ->where('id', $produto->id)
                        ->update(['codigo' => (string) $proximoPorEmpresa[$chave]]);
                }
            });

        Schema::table('produto', function (Blueprint $table) {
            $table->unique(['empresa_id', 'codigo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produto', function (Blueprint $table) {
            $table->dropUnique(['empresa_id', 'codigo']);
            $table->dropColumn(['codigo', 'favorito']);
        });
    }
};
