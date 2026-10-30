<?php

namespace App\Services;

use App\Models\Empresa;
use App\Models\User;
use App\Services\Interfaces\EmpresasServiceInterface;
use Illuminate\Support\Facades\DB;

class EmpresasService implements EmpresasServiceInterface
{
    public function criarNoOnboarding(User $usuario, string $nome, string $modulo): Empresa
    {
        return DB::transaction(function () use ($usuario, $nome, $modulo) {
            $empresa = Empresa::query()->create([
                'nome' => $nome,
                'modulo' => $modulo,
                'nome_confirmado_em' => now(),
            ]);

            $usuario->empresas()->attach($empresa->id, ['cargo' => Empresa::CARGO_ADMIN_MASTER]);
            $usuario->esquecerEmpresaAtiva();

            return $empresa;
        });
    }

    public function confirmarNome(Empresa $empresa, string $nome): Empresa
    {
        $empresa->update([
            'nome' => $nome,
            'nome_confirmado_em' => now(),
        ]);

        return $empresa;
    }
}
