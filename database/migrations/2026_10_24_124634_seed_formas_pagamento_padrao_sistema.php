<?php

use App\Models\FormaPagamento;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $padroes = [
            ['nome' => FormaPagamento::NOME_ESPECIE, 'baixa_automatica' => true],
            ['nome' => 'Pix', 'baixa_automatica' => true],
            ['nome' => 'Cartão de Crédito', 'baixa_automatica' => false],
            ['nome' => 'Cartão de Débito', 'baixa_automatica' => false],
        ];

        foreach ($padroes as $padrao) {
            FormaPagamento::query()->firstOrCreate(
                [
                    'nome' => $padrao['nome'],
                    'padrao' => 1,
                    'usuario_id' => null,
                ],
                [
                    'ativo' => true,
                    'baixa_automatica' => $padrao['baixa_automatica'],
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        FormaPagamento::query()
            ->where('padrao', 1)
            ->whereNull('usuario_id')
            ->whereIn('nome', [FormaPagamento::NOME_ESPECIE, 'Pix', 'Cartão de Crédito', 'Cartão de Débito'])
            ->delete();
    }
};
