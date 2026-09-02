<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('financeiro', function (Blueprint $table) {
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            if (Schema::hasColumn('financeiro', 'valor_total')) {
                $table->dropColumn('valor_total');
            }
            
            $table->decimal('valor', 15, 2);
        
            if (Schema::hasColumn('financeiro', 'qtd_parcelas')) {
                $table->dropColumn('qtd_parcelas');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financeiro', function (Blueprint $table) {
            // restaurar qtd_parcelas
            if (! Schema::hasColumn('financeiro', 'qtd_parcelas')) {
                $table->integer('qtd_parcelas')->default(1);
            }
            // remover foreign keys e colunas adicionadas
            if (Schema::hasColumn('financeiro', 'usuario_id')) {
                $table->dropForeign(['usuario_id']);
                $table->dropColumn('usuario_id');
            }

            if (Schema::hasColumn('financeiro', 'valor')) {
                $table->dropColumn('valor');
            }
        });
    }
};

