<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Perguntas que o Copiloto não soube responder (sem o usuário) e interesses em módulos.
     */
    public function up(): void
    {
        Schema::create('copiloto_pergunta_sem_resposta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas')->nullOnDelete();
            $table->text('pergunta');
            $table->string('tela', 100)->nullable();
            $table->timestamps();
        });

        Schema::create('copiloto_interesse', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('modulo', 50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('copiloto_interesse');
        Schema::dropIfExists('copiloto_pergunta_sem_resposta');
    }
};
