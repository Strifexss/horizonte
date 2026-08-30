<?php

use App\Http\Controllers\ContasController;
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

    Route::get('extrato', [ExtratoController::class, 'index'])->name('extrato');
    
    Route::group(['prefix' => 'contas'], function () {
        Route::get('/', [ContasController::class, 'index'])->name('contas');
        Route::post('/', [ContasController::class, 'store'])->name('contas.store');
        Route::put('/{id}', [ContasController::class, 'update'])->name('contas.update');
        Route::delete('/{id}', [ContasController::class, 'destroy'])->name('contas.destroy');
    }); 
    
    Route::group(['prefix' => 'categorias'], function () {
        Route::get('/', [\App\Http\Controllers\CategoriaController::class, 'index'])->name('categorias');
        Route::post('/', [\App\Http\Controllers\CategoriaController::class, 'store'])->name('categorias.store');
        Route::put('/{id}', [\App\Http\Controllers\CategoriaController::class, 'update'])->name('categorias.update');
        Route::delete('/{id}', [\App\Http\Controllers\CategoriaController::class, 'destroy'])->name('categorias.destroy');
    });
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
