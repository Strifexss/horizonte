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
        Schema::create('novidade', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->text('descricao');
            $table->string('categoria', 20);
            $table->string('status', 20)->default('rascunho');
            $table->string('imagem_path')->nullable();
            $table->string('cta_url', 500)->nullable();
            $table->boolean('popup_automatico')->default(false);
            $table->timestamp('publicada_em')->nullable();
            $table->timestamps();

            $table->index(['status', 'publicada_em']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('novidade');
    }
};
