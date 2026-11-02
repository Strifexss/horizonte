<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Quem compra da Empresa. O CONSUMIDOR é padrão do sistema (sem Empresa) e toda venda
     * sem cliente escolhido fica com ele.
     */
    public function up(): void
    {
        Schema::create('cliente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas')->cascadeOnDelete();
            $table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nome');
            $table->string('telefone', 30)->nullable();
            $table->string('documento', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('observacao', 500)->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            $table->index(['empresa_id', 'nome']);
        });

        $agora = now();
        $consumidorId = DB::table('cliente')->insertGetId([
            'nome' => 'CONSUMIDOR',
            'ativo' => true,
            'created_at' => $agora,
            'updated_at' => $agora,
        ]);

        Schema::table('venda', function (Blueprint $table) {
            $table->foreignId('cliente_id')->nullable()->after('empresa_id')->constrained('cliente');
        });

        DB::table('venda')->update(['cliente_id' => $consumidorId]);

        Schema::table('venda', function (Blueprint $table) {
            $table->foreignId('cliente_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('venda', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cliente_id');
        });

        Schema::dropIfExists('cliente');
    }
};
