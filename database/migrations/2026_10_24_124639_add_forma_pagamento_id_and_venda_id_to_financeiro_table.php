<?php

use App\Models\FormaPagamento;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('financeiro', function (Blueprint $table) {
            $table->foreignId('forma_pagamento_id')->nullable()->after('tipo')->constrained('forma_pagamento')->restrictOnDelete();
            $table->foreignId('venda_id')->nullable()->after('forma_pagamento_id')->constrained('venda')->nullOnDelete();
        });

        $especieId = FormaPagamento::query()
            ->where('nome', FormaPagamento::NOME_ESPECIE)
            ->where('padrao', 1)
            ->whereNull('usuario_id')
            ->value('id');

        DB::table('financeiro')
            ->whereNull('forma_pagamento_id')
            ->update(['forma_pagamento_id' => $especieId]);

        Schema::table('financeiro', function (Blueprint $table) {
            $table->unsignedBigInteger('forma_pagamento_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financeiro', function (Blueprint $table) {
            $table->dropConstrainedForeignId('venda_id');
            $table->dropConstrainedForeignId('forma_pagamento_id');
        });
    }
};
