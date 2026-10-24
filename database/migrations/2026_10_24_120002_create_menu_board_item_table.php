<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_board_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_board_id')->constrained('menu_board')->cascadeOnDelete();
            $table->foreignId('produto_id')->constrained('produto')->cascadeOnDelete();
            $table->boolean('destaque')->default(false);
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();

            $table->unique(['menu_board_id', 'produto_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_board_item');
    }
};
