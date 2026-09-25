<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ContasController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExtratoController;
use App\Http\Controllers\FuncionariosController;
use App\Http\Controllers\ParcelaController;
use App\Http\Controllers\ProdutosController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

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
        Route::get('/', [CategoriaController::class, 'index'])->name('categorias');
        Route::get('/autocomplete', [CategoriaController::class, 'autocomplete'])->name('categorias.autocomplete');
        Route::post('/', [CategoriaController::class, 'store'])->name('categorias.store');
        Route::put('/{id}', [CategoriaController::class, 'update'])->name('categorias.update');
        Route::delete('/{id}', [CategoriaController::class, 'destroy'])->name('categorias.destroy');
    });

    Route::group(['prefix' => 'produtos'], function () {
        Route::get('/', [ProdutosController::class, 'index'])->name('produtos');
        Route::get('/autocomplete', [ProdutosController::class, 'autocomplete'])->name('produtos.autocomplete');
        Route::post('/', [ProdutosController::class, 'store'])->name('produtos.store');
        Route::put('/{id}', [ProdutosController::class, 'update'])->name('produtos.update');
        Route::delete('/{id}', [ProdutosController::class, 'destroy'])->name('produtos.destroy');
    });

    Route::group(['prefix' => 'funcionarios'], function () {
        Route::get('/', [FuncionariosController::class, 'index'])->name('funcionarios');
        Route::get('/autocomplete', [FuncionariosController::class, 'autocomplete'])->name('funcionarios.autocomplete');
        Route::post('/', [FuncionariosController::class, 'store'])->name('funcionarios.store');
        Route::put('/{id}', [FuncionariosController::class, 'update'])->name('funcionarios.update');
        Route::delete('/{id}', [FuncionariosController::class, 'destroy'])->name('funcionarios.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
