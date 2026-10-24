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
        Schema::create('venda_pagamento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venda_id')->constrained('venda')->cascadeOnDelete();
            $table->foreignId('forma_pagamento_id')->constrained('forma_pagamento')->restrictOnDelete();
            $table->decimal('valor', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venda_pagamento');
    }
};
