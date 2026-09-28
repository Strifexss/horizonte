<?php

use App\Models\User;

it('returns a pdf from the extrato route for authenticated users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('extrato.pdf'))
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'application/pdf');
});

