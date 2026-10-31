<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * O "módulo" do MVP1 vira o Segmento da Empresa; toda Empresa existente vai para Varejo.
     */
    public function up(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->foreignId('segmento_id')->nullable()->after('nome')->constrained('segmentos')->restrictOnDelete();
        });

        DB::table('empresas')->update([
            'segmento_id' => DB::table('segmentos')->where('chave', 'varejo')->value('id'),
        ]);

        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn('modulo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->string('modulo', 20)->default('varejo');
        });

        DB::table('empresas')->update(['modulo' => 'varejo']);

        Schema::table('empresas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('segmento_id');
        });
    }
};
