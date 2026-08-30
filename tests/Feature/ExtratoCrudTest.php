<?php

use App\Models\User;
use App\Models\Financeiro;
use App\Repositories\FinanceiroRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(Tests\TestCase::class, RefreshDatabase::class);

it('stores and lists financeiro records for authenticated user', function () {
    $user = User::factory()->create();
    Auth::login($user);

    $data = [
        'descricao' => 'Teste',
        'valor' => 100.00,
        'tipo' => 'RECEITA',
        'conta_id' => 1,
        'usuario_id' => $user->id,
    ];

    // store via repository
    $repo = app(FinanceiroRepository::class);
    $created = $repo->store($data);
    expect($created)->toBeInstanceOf(Financeiro::class);
    expect($created->usuario_id)->toBe($user->id);

    $paginator = $repo->search(15);
    expect($paginator->total())->toBeGreaterThanOrEqual(1);
});

