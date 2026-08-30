<?php

namespace App\Providers;

use App\Repositories\ContaRepository;
use App\Repositories\Interfaces\ContaRepositoryInterface;
use App\Services\ContasService;
use App\Services\Interfaces\ContasServiceInterface;
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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
