<?php

namespace App\Providers;

use App\Repositories\ContaRepository;
use App\Repositories\Interfaces\ContaRepositoryInterface;
use App\Services\ContasService;
use App\Services\Interfaces\ContasServiceInterface;
use App\Repositories\CategoriaRepository;
use App\Repositories\Interfaces\CategoriaRepositoryInterface;
use App\Services\CategoriaService;
use App\Services\Interfaces\CategoriaServiceInterface;
use App\Repositories\FinanceiroRepository;
use App\Repositories\Interfaces\FinanceiroRepositoryInterface;
use App\Services\ExtratoService;
use App\Services\Interfaces\ExtratoServiceInterface;
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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
