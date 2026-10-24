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
        Schema::create('venda_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venda_id')->constrained('venda')->cascadeOnDelete();
            $table->foreignId('produto_id')->constrained('produto')->restrictOnDelete();
            $table->decimal('quantidade', 10, 3);
            $table->decimal('valor_unitario', 15, 2);
            $table->decimal('valor_total', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venda_item');
    }
};
