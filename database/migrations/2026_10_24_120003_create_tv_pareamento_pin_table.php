<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tv_pareamento_pin', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->char('pin', 4);
            $table->timestamp('expira_em');
            $table->timestamp('usado_em')->nullable();
            $table->timestamps();

            $table->index(['pin', 'usado_em', 'expira_em']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tv_pareamento_pin');
    }
};
