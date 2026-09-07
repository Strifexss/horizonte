<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $dados = [
            'kpis' => [
                [
                    'label' => 'Receita Líquida',
                    'value' => '$398,8M',
                    'hint' => '+12,4% vs FY2025',
                    'icon' => 'TrendingUp',
                ],
                [
                    'label' => 'Market Share',
                    'value' => '24,6%',
                    'hint' => '+4,2pp vs 2025 • #1 Rankeado',
                    'icon' => 'PieChart',
                ],
                [
                    'label' => 'Unidades Vendidas',
                    'value' => '3,17M',
                    'hint' => '+14,8% vs FY2025',
                    'icon' => 'Package',
                ],
                [
                    'label' => 'Margem Bruta',
                    'value' => '42,8%',
                    'hint' => '+1,8pp vs FY2025',
                    'icon' => 'Percent',
                ],
            ],

            // Regional Sales — barras verticais (barY)
            'regionalSales' => [
                ['label' => 'Norte', 'value' => 148.2],
                ['label' => 'Europa', 'value' => 114.6],
                ['label' => 'Ásia-Pacífico', 'value' => 86.3],
                ['label' => 'América Latina', 'value' => 35.1],
                ['label' => 'Outros', 'value' => 14.6],
            ],

            // Market Share — donut (pie)
            'marketShare' => [
                ['label' => 'Aura Tech', 'value' => 24.6],
                ['label' => 'TechWave Inc', 'value' => 18.3],
                ['label' => 'NovaSound', 'value' => 15.7],
                ['label' => 'AudioMax', 'value' => 12.4],
                ['label' => 'SoundCore', 'value' => 10.2],
                ['label' => 'Outros', 'value' => 18.8],
            ],

            // Price-Band Mix — barras empilhadas por trimestre
            'priceBandMix' => [
                'labels' => ['Q1', 'Q2', 'Q3', 'Q4'],
                'series' => [
                    ['label' => 'Premium', 'data' => [30.2, 34.5, 38.1, 42.3]],
                    ['label' => 'Mid-Range', 'data' => [22.8, 24.1, 25.6, 27.2]],
                    ['label' => 'Entry', 'data' => [8.4, 9.3, 10.2, 11.5]],
                ],
            ],

            // YOY Product Line — barras horizontais
            'productLines' => [
                ['label' => 'Wireless Audio', 'value' => 148.5],
                ['label' => 'Smart Wearables', 'value' => 112.3],
                ['label' => 'Home Cinema', 'value' => 78.6],
                ['label' => 'Gaming Peripherals', 'value' => 42.1],
                ['label' => 'Professional Audio', 'value' => 17.3],
            ],

            // Monthly Revenue — linha mensal
            'monthlyRevenue' => [
                ['label' => 'Jan', 'value' => 28.4],
                ['label' => 'Fev', 'value' => 26.1],
                ['label' => 'Mar', 'value' => 31.2],
                ['label' => 'Abr', 'value' => 29.8],
                ['label' => 'Mai', 'value' => 33.5],
                ['label' => 'Jun', 'value' => 35.1],
                ['label' => 'Jul', 'value' => 38.2],
                ['label' => 'Ago', 'value' => 36.7],
                ['label' => 'Set', 'value' => 40.3],
                ['label' => 'Out', 'value' => 43.1],
                ['label' => 'Nov', 'value' => 45.8],
                ['label' => 'Dez', 'value' => 48.0],
            ],

            // Retail Channels — barras horizontais com %
            'retailChannels' => [
                ['label' => 'Direct E-Com', 'value' => 38, 'pct' => '38%'],
                ['label' => 'Retail Electronics', 'value' => 32, 'pct' => '32%'],
                ['label' => 'Mass Merch', 'value' => 18, 'pct' => '18%'],
                ['label' => 'Brand Stores', 'value' => 8, 'pct' => '8%'],
                ['label' => 'Others', 'value' => 4, 'pct' => '4%'],
            ],

            // Annual target
            'annualTarget' => [
                'current' => 398.8,
                'target' => 500,
            ],
        ];

        return Inertia::render('dashboard', $dados);
    }
}
