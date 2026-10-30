<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Cada usuário existente ganha "Empresa de [nome]", com nome ainda não confirmado,
     * e entra nela como admin master.
     */
    public function up(): void
    {
        $agora = now();

        DB::table('users')->orderBy('id')->each(function (object $usuario) use ($agora): void {
            $empresaId = DB::table('empresas')->insertGetId([
                'nome' => mb_substr('Empresa de '.$usuario->name, 0, 120),
                'modulo' => 'varejo',
                'nome_confirmado_em' => null,
                'created_at' => $agora,
                'updated_at' => $agora,
            ]);

            DB::table('empresa_user')->insert([
                'empresa_id' => $empresaId,
                'user_id' => $usuario->id,
                'cargo' => 'admin_master',
                'created_at' => $agora,
                'updated_at' => $agora,
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('empresa_user')->delete();
        DB::table('empresas')->delete();
    }
};
