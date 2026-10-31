<?php

namespace Database\Factories;

use App\Models\Empresa;
use App\Models\Segmento;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Empresa>
 */
class EmpresaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => fake()->company(),
            'segmento_id' => fn () => Segmento::varejoId(),
            'nome_confirmado_em' => now(),
        ];
    }

    public function nomeNaoConfirmado(): static
    {
        return $this->state(fn () => ['nome_confirmado_em' => null]);
    }

    public function restaurante(): static
    {
        return $this->state(fn () => ['segmento_id' => Segmento::query()->where('chave', Segmento::RESTAURANTE)->value('id')]);
    }
}
