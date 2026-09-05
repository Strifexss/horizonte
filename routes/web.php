<?php

use App\Http\Controllers\ContasController;
use App\Http\Controllers\ExtratoController;
use App\Http\Controllers\ParcelaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::group(['prefix' => 'extrato'], function () {
        Route::get('/', [ExtratoController::class, 'index'])->name('extrato.index');
        Route::post('/', [ExtratoController::class, 'store'])->name('extrato.store');
        Route::put('/{id}', [ExtratoController::class, 'update'])->name('extrato.update');
        Route::delete('/{id}', [ExtratoController::class, 'destroy'])->name('extrato.destroy');
    });

    Route::group(['prefix' => 'parcela'], function () {
        Route::put('/{id}', [ParcelaController::class, 'update'])->name('parcela.update');
        Route::delete('/{id}', [ParcelaController::class, 'destroy'])->name('parcela.destroy');
    });
    
    Route::group(['prefix' => 'contas'], function () {
        Route::get('/', [ContasController::class, 'index'])->name('contas');
        Route::post('/', [ContasController::class, 'store'])->name('contas.store');
        Route::get('/autocomplete', [ContasController::class, 'autocomplete'])->name('contas.autocomplete');
        Route::put('/{id}', [ContasController::class, 'update'])->name('contas.update');
        Route::delete('/{id}', [ContasController::class, 'destroy'])->name('contas.destroy');
    }); 
    
    Route::group(['prefix' => 'categorias'], function () {
        Route::get('/', [\App\Http\Controllers\CategoriaController::class, 'index'])->name('categorias');
        Route::get('/autocomplete', [\App\Http\Controllers\CategoriaController::class, 'autocomplete'])->name('categorias.autocomplete');
        Route::post('/', [\App\Http\Controllers\CategoriaController::class, 'store'])->name('categorias.store');
        Route::put('/{id}', [\App\Http\Controllers\CategoriaController::class, 'update'])->name('categorias.update');
        Route::delete('/{id}', [\App\Http\Controllers\CategoriaController::class, 'destroy'])->name('categorias.destroy');
    });
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
