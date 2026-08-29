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
        Schema::create('financeiro', function (Blueprint $table) {
            $table->id();
            $table->string('descricao');
            $table->decimal('valor_total', 15, 2);

            $table->enum('tipo', ['RECEITA', 'DESPESA']);
            $table->unsignedBigInteger('conta_id');
            $table->integer('qtd_parcelas')->default(1);
            $table->timestamp('data_criacao')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financeiro');
    }
};
