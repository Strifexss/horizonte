<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insight_acao', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('dashboard_analise_id')->constrained('dashboard_analise')->cascadeOnDelete();
            $table->string('chave', 40);
            $table->string('tipo', 20);
            $table->string('titulo');
            $table->string('acao', 20);
            $table->string('motivo', 40)->nullable();
            $table->unsignedSmallInteger('ano');
            $table->unsignedTinyInteger('mes');
            $table->timestamps();

            $table->unique(['dashboard_analise_id', 'chave']);
            $table->index(['usuario_id', 'acao']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insight_acao');
    }
};
