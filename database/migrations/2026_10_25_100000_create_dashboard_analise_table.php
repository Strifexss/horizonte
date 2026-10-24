<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dashboard_analise', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedSmallInteger('ano');
            $table->unsignedTinyInteger('mes');
            $table->string('status', 20);
            $table->char('hash_dados', 64);
            $table->json('pacote');
            $table->text('resumo')->nullable();
            $table->json('insights')->nullable();
            $table->json('resultados_acoes')->nullable();
            $table->string('erro')->nullable();
            $table->unsignedSmallInteger('insights_descartados')->default(0);
            $table->string('modelo', 80)->nullable();
            $table->timestamps();

            $table->index(['usuario_id', 'ano', 'mes']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dashboard_analise');
    }
};
