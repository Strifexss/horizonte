<?php

namespace App\Providers;

use App\Repositories\CategoriaRepository;
use App\Repositories\ContaRepository;
use App\Repositories\FinanceiroParcelaRepository;
use App\Repositories\FinanceiroRepository;
use App\Repositories\FornecedorRepository;
use App\Repositories\FuncionarioRepository;
use App\Repositories\GrupoRepository;
use App\Repositories\Interfaces\CategoriaRepositoryInterface;
use App\Repositories\Interfaces\ContaRepositoryInterface;
use App\Repositories\Interfaces\FinanceiroParcelaRepositoryInterface;
use App\Repositories\Interfaces\FinanceiroRepositoryInterface;
use App\Repositories\Interfaces\FornecedorRepositoryInterface;
use App\Repositories\Interfaces\FuncionarioRepositoryInterface;
use App\Repositories\Interfaces\GrupoRepositoryInterface;
use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use App\Repositories\ProdutoRepository;
use App\Services\CategoriaService;
use App\Services\ContasService;
use App\Services\ExtratoService;
use App\Services\FinanceiroParcelaService;
use App\Services\FornecedoresService;
use App\Services\FuncionariosService;
use App\Services\GruposService;
use App\Services\Interfaces\CategoriaServiceInterface;
use App\Services\Interfaces\ContasServiceInterface;
use App\Services\Interfaces\ExtratoServiceInterface;
use App\Services\Interfaces\FinanceiroParcelaServiceInterface;
use App\Services\Interfaces\FornecedoresServiceInterface;
use App\Services\Interfaces\FuncionariosServiceInterface;
use App\Services\Interfaces\GruposServiceInterface;
use App\Services\Interfaces\ProdutosServiceInterface;
use App\Services\ProdutosService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ContasServiceInterface::class, ContasService::class);
        $this->app->bind(ContaRepositoryInterface::class, ContaRepository::class);
        $this->app->bind(CategoriaServiceInterface::class, CategoriaService::class);
        $this->app->bind(CategoriaRepositoryInterface::class, CategoriaRepository::class);
        $this->app->bind(ExtratoServiceInterface::class, ExtratoService::class);
        $this->app->bind(FinanceiroRepositoryInterface::class, FinanceiroRepository::class);
        $this->app->bind(FinanceiroParcelaRepositoryInterface::class, FinanceiroParcelaRepository::class);
        $this->app->bind(FinanceiroParcelaServiceInterface::class, FinanceiroParcelaService::class);
        $this->app->bind(ProdutosServiceInterface::class, ProdutosService::class);
        $this->app->bind(ProdutoRepositoryInterface::class, ProdutoRepository::class);
        $this->app->bind(FuncionariosServiceInterface::class, FuncionariosService::class);
        $this->app->bind(FuncionarioRepositoryInterface::class, FuncionarioRepository::class);
        $this->app->bind(FornecedoresServiceInterface::class, FornecedoresService::class);
        $this->app->bind(FornecedorRepositoryInterface::class, FornecedorRepository::class);
        $this->app->bind(GruposServiceInterface::class, GruposService::class);
        $this->app->bind(GrupoRepositoryInterface::class, GrupoRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
