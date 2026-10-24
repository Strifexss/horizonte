<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ContasController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExtratoController;
use App\Http\Controllers\ExtratoPdfController;
use App\Http\Controllers\FormasPagamentoController;
use App\Http\Controllers\FornecedoresController;
use App\Http\Controllers\FuncionariosController;
use App\Http\Controllers\GruposController;
use App\Http\Controllers\NovidadesController;
use App\Http\Controllers\NovidadesUsuarioController;
use App\Http\Controllers\ParcelaController;
use App\Http\Controllers\ProdutosController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\VendasController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::group(['prefix' => 'extrato'], function () {
        Route::get('/', [ExtratoController::class, 'index'])->name('extrato.index');
        Route::get('/pdf', [ExtratoPdfController::class, '__invoke'])->name('extrato.pdf');
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

    Route::group(['prefix' => 'fornecedores'], function () {
        Route::get('/', [FornecedoresController::class, 'index'])->name('fornecedores');
        Route::get('/autocomplete', [FornecedoresController::class, 'autocomplete'])->name('fornecedores.autocomplete');
        Route::post('/', [FornecedoresController::class, 'store'])->name('fornecedores.store');
        Route::put('/{id}', [FornecedoresController::class, 'update'])->name('fornecedores.update');
        Route::delete('/{id}', [FornecedoresController::class, 'destroy'])->name('fornecedores.destroy');
    });

    Route::group(['prefix' => 'grupos'], function () {
        Route::get('/', [GruposController::class, 'index'])->name('grupos');
        Route::get('/autocomplete', [GruposController::class, 'autocomplete'])->name('grupos.autocomplete');
        Route::post('/', [GruposController::class, 'store'])->name('grupos.store');
        Route::put('/{id}', [GruposController::class, 'update'])->name('grupos.update');
        Route::delete('/{id}', [GruposController::class, 'destroy'])->name('grupos.destroy');
    });

    Route::group(['prefix' => 'formas-pagamento'], function () {
        Route::get('/', [FormasPagamentoController::class, 'index'])->name('formas-pagamento');
        Route::get('/autocomplete', [FormasPagamentoController::class, 'autocomplete'])->name('formas-pagamento.autocomplete');
        Route::post('/', [FormasPagamentoController::class, 'store'])->name('formas-pagamento.store');
        Route::put('/{id}', [FormasPagamentoController::class, 'update'])->name('formas-pagamento.update');
        Route::delete('/{id}', [FormasPagamentoController::class, 'destroy'])->name('formas-pagamento.destroy');
    });

    Route::group(['prefix' => 'vendas'], function () {
        Route::get('/', [VendasController::class, 'index'])->name('vendas');
        Route::get('/produtos', [VendasController::class, 'produtosAutocomplete'])->name('vendas.produtos');
        Route::post('/', [VendasController::class, 'store'])->name('vendas.store');
        Route::put('/{id}', [VendasController::class, 'update'])->name('vendas.update');
        Route::post('/{id}/cancelar', [VendasController::class, 'cancelar'])->name('vendas.cancelar');
    });

    Route::group(['prefix' => 'funcionarios'], function () {
        Route::get('/', [FuncionariosController::class, 'index'])->name('funcionarios');
        Route::get('/autocomplete', [FuncionariosController::class, 'autocomplete'])->name('funcionarios.autocomplete');
        Route::post('/', [FuncionariosController::class, 'store'])->name('funcionarios.store');
        Route::put('/{id}', [FuncionariosController::class, 'update'])->name('funcionarios.update');
        Route::delete('/{id}', [FuncionariosController::class, 'destroy'])->name('funcionarios.destroy');
    });

    Route::group(['prefix' => 'novidades'], function () {
        Route::post('/{id}/dispensar', [NovidadesUsuarioController::class, 'dispensar'])->name('novidades.dispensar');
    });
});

if (filled(config('admin.path'))) {
    Route::middleware(['administrador'])
        ->prefix(config('admin.path'))
        ->name('admin.')
        ->group(function () {
            Route::get('/', [UsuariosController::class, 'index'])->name('usuarios');
            Route::post('/usuarios', [UsuariosController::class, 'store'])->name('usuarios.store');
            Route::get('/usuarios/autocomplete', [UsuariosController::class, 'autocomplete'])->name('usuarios.autocomplete');
            Route::put('/usuarios/{id}', [UsuariosController::class, 'update'])->name('usuarios.update');
            Route::delete('/usuarios/{id}', [UsuariosController::class, 'destroy'])->name('usuarios.destroy');
            Route::post('/usuarios/transfer', [UsuariosController::class, 'transfer'])->name('usuarios.transfer');
            Route::get('/usuarios/{id}/transfer-counts', [UsuariosController::class, 'transferCounts'])->name('usuarios.transfer.counts');
            Route::post('/usuarios/{id}/entrar-como', [UsuariosController::class, 'entrarComo'])->name('usuarios.entrar-como');

            Route::get('/novidades', [NovidadesController::class, 'index'])->name('novidades');
            Route::post('/novidades', [NovidadesController::class, 'store'])->name('novidades.store');
            Route::put('/novidades/{id}', [NovidadesController::class, 'update'])->name('novidades.update');
            Route::delete('/novidades/{id}', [NovidadesController::class, 'destroy'])->name('novidades.destroy');
            Route::put('/novidades/{id}/status', [NovidadesController::class, 'status'])->name('novidades.status');
            Route::delete('/novidades/imagens/{arquivo}', [NovidadesController::class, 'excluirImagem'])
                ->where('arquivo', '[A-Za-z0-9_-]+\.[A-Za-z0-9]+')
                ->name('novidades.imagens.destroy');
        });
}

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
