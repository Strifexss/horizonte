<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabelas cujo dono passa a ser a Empresa. `usuario_id` fica como autor; em
     * `categoria` e `forma_pagamento`, `empresa_id` nulo continua sendo padrão do sistema.
     *
     * @var list<string>
     */
    private array $tabelas = [
        'conta',
        'categoria',
        'forma_pagamento',
        'financeiro',
        'financeiro_parcela',
        'produto',
        'fornecedor',
        'grupos',
        'funcionario',
        'menu_board',
        'tv_pareamento_pin',
        'tv_dispositivo',
        'venda',
        'dashboard_analise',
        'insight_acao',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach ($this->tabelas as $tabela) {
            Schema::table($tabela, function (Blueprint $table) {
                $table->foreignId('empresa_id')->nullable()->after('id')->constrained('empresas')->cascadeOnDelete();
            });

            DB::table($tabela)
                ->whereNotNull('usuario_id')
                ->update([
                    'empresa_id' => DB::raw('(select empresa_user.empresa_id from empresa_user where empresa_user.user_id = '.$tabela.'.usuario_id order by empresa_user.id limit 1)'),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach ($this->tabelas as $tabela) {
            Schema::table($tabela, function (Blueprint $table) {
                $table->dropConstrainedForeignId('empresa_id');
            });
        }
    }
};
