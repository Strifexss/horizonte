<?php

namespace Database\Factories;

use App\Models\Empresa;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Toda conta trabalha dentro de uma Empresa: por padrão nasce com a sua, como admin master.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (User $user): void {
            $user->empresas()->attach(Empresa::factory()->create(), ['cargo' => Empresa::CARGO_ADMIN_MASTER]);
        });
    }

    /**
     * Conta que ainda não passou pelo onboarding.
     */
    public function semEmpresa(): static
    {
        return $this->afterCreating(function (User $user): void {
            $empresas = $user->empresas()->pluck('empresas.id');
            $user->empresas()->detach();
            Empresa::query()->whereKey($empresas)->delete();
            $user->esquecerEmpresaAtiva();
        });
    }

    /**
     * Conta criada pelo login com Google (sem senha).
     */
    public function google(): static
    {
        return $this->state(fn (array $attributes) => [
            'google_id' => (string) fake()->unique()->numerify('#####################'),
            'password' => null,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
