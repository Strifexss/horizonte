<?php

use App\Http\Controllers\ExtratoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('extrato', [ExtratoController::class, 'index'])->name('extrato');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
