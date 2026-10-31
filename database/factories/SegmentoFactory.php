<?php

namespace Database\Factories;

use App\Models\Segmento;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Segmento>
 */
class SegmentoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nome = fake()->unique()->words(2, true);

        return [
            'chave' => Str::slug($nome, '_'),
            'nome' => Str::title($nome),
            'descricao' => fake()->sentence(),
            'modulos' => [],
            'ativo' => true,
        ];
    }

    public function inativo(): static
    {
        return $this->state(fn () => ['ativo' => false]);
    }
}
