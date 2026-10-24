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
        Schema::create('forma_pagamento', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->boolean('ativo')->default(true);
            $table->boolean('baixa_automatica')->default(true);
            $table->unsignedTinyInteger('padrao')->default(0);
            $table->foreignId('usuario_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forma_pagamento');
    }
};
