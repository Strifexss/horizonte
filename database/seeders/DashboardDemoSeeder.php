<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->firstOrCreate(
            ['email' => 'dono@horizonte.test'],
            [
                'name' => 'Dono Horizonte',
                'password' => 'horizonte-demo',
            ],
        );

        $user->forceFill([
            'name' => 'Dono Horizonte',
            'password' => 'horizonte-demo',
        ])->save();

        $conta = Conta::query()->firstOrCreate(
            [
                'nome' => 'Conta demo',
                'usuario_id' => $user->id,
            ],
        );

        $categoriaReceita = Categoria::query()->firstOrCreate(
            [
                'nome' => 'Receita demo',
                'tipo' => 'receita',
                'usuario_id' => $user->id,
            ],
        );

        $inicioSemana = now()->startOfWeek(Carbon::MONDAY)->startOfDay();

        FinanceiroParcela::query()
            ->where('usuario_id', $user->id)
            ->where('descricao', 'like', 'Demo dashboard receita%')
            ->delete();

        Financeiro::query()
            ->where('usuario_id', $user->id)
            ->where('descricao', 'like', 'Demo dashboard receita%')
            ->delete();

        $valores = [
            0 => 3200,
            1 => 800,
            2 => 1500,
            3 => 0,
            4 => 2100,
            5 => 450,
            6 => 900,
        ];

        foreach ($valores as $offset => $valor) {
            if ($valor <= 0) {
                continue;
            }

            $competencia = $inicioSemana->copy()->addDays($offset)->toDateString();
            $descricao = 'Demo dashboard receita '.$competencia;

            $financeiro = Financeiro::query()->create([
                'descricao' => $descricao,
                'valor' => $valor,
                'tipo' => 'RECEITA',
                'usuario_id' => $user->id,
            ]);

            FinanceiroParcela::query()->create([
                'descricao' => $descricao,
                'data_vencimento' => $competencia,
                'data_competencia' => $competencia,
                'valor' => $valor,
                'valor_pago' => 0,
                'parcela' => 1,
                'financeiro_id' => $financeiro->id,
                'conta_id' => $conta->id,
                'categoria_id' => $categoriaReceita->id,
                'usuario_id' => $user->id,
            ]);
        }
    }
}
