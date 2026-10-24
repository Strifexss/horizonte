<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tv_dispositivo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->string('nome', 80)->default('TV do Balcão');
            $table->char('token_hash', 64)->unique();
            $table->timestamp('ultimo_acesso_em')->nullable();
            $table->timestamp('revogado_em')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tv_dispositivo');
    }
};
