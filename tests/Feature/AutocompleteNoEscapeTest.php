<?php

use App\Models\Produto;
use App\Models\User;
use Illuminate\Support\Facades\DB;

it('does not generate SQL with ESCAPE clause during autocomplete', function () {
    $user = User::factory()->create();

    Produto::query()->create([
        'nome' => 'Maçã Fuji',
        'preco_compra' => 2.5,
        'usuario_id' => $user->id,
    ]);

    DB::flushQueryLog();
    DB::enableQueryLog();

    $this->actingAs($user)
        ->getJson(route('produtos.autocomplete', ['q' => 'Maca']))
        ->assertOk();

    $queries = DB::getQueryLog();
    // Ensure none of the executed queries include an explicit ESCAPE clause.
    foreach ($queries as $q) {
        expect(stripos($q['query'], 'ESCAPE') === false)->toBeTrue();
    }
});

