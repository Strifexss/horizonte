<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Configurações globais editáveis no painel de admin (chave → valor).
     */
    public function up(): void
    {
        Schema::create('configuracao', function (Blueprint $table) {
            $table->id();
            $table->string('chave', 100)->unique();
            $table->text('valor')->nullable();
            $table->timestamps();
        });

        DB::table('configuracao')->insert([
            'chave' => 'suporte_whatsapp',
            'valor' => '83988003516',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracao');
    }
};
