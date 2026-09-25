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
        Schema::table('financeiro_parcela', function (Blueprint $table) {
            $table->foreignId('produto_id')
                ->nullable()
                ->after('categoria_id')
                ->constrained('produto')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financeiro_parcela', function (Blueprint $table) {
            $table->dropConstrainedForeignId('produto_id');
        });
    }
};
