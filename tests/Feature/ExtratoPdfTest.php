<?php

use App\Models\User;

it('returns a pdf from the extrato route for authenticated users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('extrato.pdf'))
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'application/pdf');
});

it('embeds the horizonte logo in the extrato pdf view', function (): void {
    $html = view('pdfs.extrato', [
        'parcelas' => collect(),
        'resumo' => ['total_credits' => 0, 'total_debits' => 0],
        'filters' => [],
    ])->render();

    expect(is_file(public_path('branding/logo-light-bg.svg')))->toBeTrue()
        ->and($html)->toContain('logo-light-bg.svg');
});
