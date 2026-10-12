<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\Grupo;
use App\Models\Produto;
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

        $this->seedDespesasPorGrupo($user, $conta);
    }

    private function seedDespesasPorGrupo(User $user, Conta $conta): void
    {
        $categoriaDespesa = Categoria::query()->firstOrCreate(
            [
                'nome' => 'Despesa demo',
                'tipo' => 'despesa',
                'usuario_id' => $user->id,
            ],
        );

        $hardware = Grupo::query()->firstOrCreate(
            [
                'nome' => 'Hardware',
                'usuario_id' => $user->id,
            ],
        );

        $escritorio = Grupo::query()->firstOrCreate(
            [
                'nome' => 'Escritório',
                'usuario_id' => $user->id,
            ],
        );

        $mouse = Produto::query()->firstOrCreate(
            [
                'nome' => 'Mouse demo',
                'usuario_id' => $user->id,
            ],
            [
                'preco_compra' => 80,
                'grupo_id' => $hardware->id,
            ],
        );
        $mouse->forceFill(['grupo_id' => $hardware->id])->save();

        $teclado = Produto::query()->firstOrCreate(
            [
                'nome' => 'Teclado demo',
                'usuario_id' => $user->id,
            ],
            [
                'preco_compra' => 180,
                'grupo_id' => $hardware->id,
            ],
        );
        $teclado->forceFill(['grupo_id' => $hardware->id])->save();

        $papel = Produto::query()->firstOrCreate(
            [
                'nome' => 'Papel demo',
                'usuario_id' => $user->id,
            ],
            [
                'preco_compra' => 25,
                'grupo_id' => $escritorio->id,
            ],
        );
        $papel->forceFill(['grupo_id' => $escritorio->id])->save();

        $cabo = Produto::query()->firstOrCreate(
            [
                'nome' => 'Cabo demo',
                'usuario_id' => $user->id,
            ],
            [
                'preco_compra' => 15,
                'grupo_id' => null,
            ],
        );
        $cabo->forceFill(['grupo_id' => null])->save();

        FinanceiroParcela::query()
            ->where('usuario_id', $user->id)
            ->where('descricao', 'like', 'Demo dashboard despesa grupo%')
            ->delete();

        Financeiro::query()
            ->where('usuario_id', $user->id)
            ->where('descricao', 'like', 'Demo dashboard despesa grupo%')
            ->delete();

        $mesAtual = now()->startOfMonth();
        $mesAnterior = $mesAtual->copy()->subMonth();

        $lancamentos = [
            [$mouse, $mesAtual->copy()->addDays(2)->toDateString(), 1200],
            [$teclado, $mesAtual->copy()->addDays(8)->toDateString(), 800],
            [$papel, $mesAtual->copy()->addDays(5)->toDateString(), 350],
            [$papel, $mesAtual->copy()->addDays(12)->toDateString(), 150],
            [$cabo, $mesAtual->copy()->addDays(4)->toDateString(), 220],
            [$mouse, $mesAnterior->copy()->addDays(3)->toDateString(), 999],
        ];

        foreach ($lancamentos as [$produto, $competencia, $valor]) {
            $descricao = 'Demo dashboard despesa grupo '.$produto->nome.' '.$competencia;

            $financeiro = Financeiro::query()->create([
                'descricao' => $descricao,
                'valor' => $valor,
                'tipo' => 'DESPESA',
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
                'categoria_id' => $categoriaDespesa->id,
                'produto_id' => $produto->id,
                'usuario_id' => $user->id,
            ]);
        }
    }
}
