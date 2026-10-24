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
        Schema::create('venda', function (Blueprint $table) {
            $table->id();
            $table->string('status', 20)->default('aberta');
            $table->decimal('total', 15, 2)->default(0);
            $table->dateTime('data_venda');
            $table->text('observacao')->nullable();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['usuario_id', 'status']);
            $table->index(['usuario_id', 'data_venda']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venda');
    }
};
