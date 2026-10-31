<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ajustes do Administrador: liga ou desliga um módulo opcional numa Empresa, por cima do Segmento.
     */
    public function up(): void
    {
        Schema::create('empresa_modulo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->cascadeOnDelete();
            $table->string('modulo', 60);
            $table->boolean('ligado');
            $table->timestamps();

            $table->unique(['empresa_id', 'modulo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empresa_modulo');
    }
};
