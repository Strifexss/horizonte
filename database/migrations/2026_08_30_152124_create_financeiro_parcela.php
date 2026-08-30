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
        Schema::create('financeiro_parcela', function (Blueprint $table) {
            $table->id();
            $table->string('descricao')->nullable();
            $table->date('data_vencimento')->nullable();
            $table->date('data_competencia')->nullable();
            $table->decimal('valor', 15, 2)->default(0);
            $table->decimal('valor_pago', 15, 2)->nullable()->default(0);
            $table->integer('parcela')->default(1);

            $table->foreignId('financeiro_id')->constrained('financeiro')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financeiro_parcela');
    }
};
