<?php

it('links the horizonte favicon on the login page', function (): void {
    $this->get(route('login'))
        ->assertOk()
        ->assertSee('/favicon.svg', false)
        ->assertSee('/favicon.ico', false)
        ->assertSee('/apple-touch-icon.png', false);
});

it('publishes the branding assets used by the app shell', function (): void {
    expect(is_file(public_path('branding/logo-icon.svg')))->toBeTrue()
        ->and(is_file(public_path('branding/logo-dark-bg.svg')))->toBeTrue()
        ->and(is_file(public_path('branding/logo-light-bg.svg')))->toBeTrue()
        ->and(is_file(public_path('favicon.svg')))->toBeTrue()
        ->and(is_file(public_path('apple-touch-icon.png')))->toBeTrue();
});
