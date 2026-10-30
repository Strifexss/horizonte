<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_board_pagina', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_board_id')->constrained('menu_board')->cascadeOnDelete();
            $table->unsignedInteger('ordem')->default(0);
            $table->string('nome', 80);
            $table->string('layout', 30);
            $table->unsignedSmallInteger('duracao_segundos')->default(15);
            $table->json('configuracao')->nullable();
            $table->string('imagem_path')->nullable();
            $table->timestamps();

            $table->index(['menu_board_id', 'ordem']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_board_pagina');
    }
};
