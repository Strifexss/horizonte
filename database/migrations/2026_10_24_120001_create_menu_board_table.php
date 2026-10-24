<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_board', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->string('nome', 80);
            $table->string('tema', 20);
            $table->boolean('ativo')->default(false);
            $table->timestamps();

            $table->index(['usuario_id', 'ativo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_board');
    }
};
