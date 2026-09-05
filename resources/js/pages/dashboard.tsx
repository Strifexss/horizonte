import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React, { useMemo } from 'react';
import { PageTitle, KpisPanel } from '@/components/padrões';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, Percent, Tag, Store, ShoppingCart, PieChart } from 'lucide-react';
import { Chart } from '@tanstack/charts/react';
import { defineChart, barY, lineY } from '@tanstack/charts';
import { tooltip } from '@tanstack/charts/tooltip';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const iconMap: Record<string, React.ReactNode> = {
    TrendingUp: <TrendingUp className="h-6 w-6" />,
    PieChart: <PieChart className="h-6 w-6" />,
    Package: <Package className="h-6 w-6" />,
    Percent: <Percent className="h-6 w-6" />,
    Tag: <Tag className="h-6 w-6" />,
    Store: <Store className="h-6 w-6" />,
    ShoppingCart: <ShoppingCart className="h-6 w-6" />,
};

const CHART_FOCUS = 'group-x' as const;
const CHART_TOOLTIP = { use: tooltip, anchor: 'group-center' as const, placement: ['top', 'right', 'left', 'bottom'] as const };

/* ---------- Regional Sales (barY vertical) ---------- */
function useRegionalChart(data: Array<{ label: string; value: number }>) {
    return useMemo(
        () =>
            defineChart({
                marks: [barY(data, { x: 'label', y: 'value' })],
                scales: {
                    x: { scale: scaleBand, padding: 0.2 },
                    y: { scale: scaleLinear, nice: true, grid: true },
                },
                focus: CHART_FOCUS,
                tooltip: CHART_TOOLTIP,
            }),
        [data],
    );
}

/* ---------- Market Share (barY vertical) ---------- */
function useShareChart(data: Array<{ label: string; value: number }>) {
    return useMemo(
        () =>
            defineChart({
                marks: [barY(data, { x: 'label', y: 'value' })],
                scales: {
                    x: { scale: scaleBand, padding: 0.2 },
                    y: { scale: scaleLinear, nice: true, grid: true, domain: [0, 30] },
                },
                focus: CHART_FOCUS,
                tooltip: CHART_TOOLTIP,
            }),
        [data],
    );
}

/* ---------- Price-Band Mix (barY empilhado) ---------- */
function usePriceBandChart(payload: { labels: string[]; series: Array<{ label: string; data: number[] }> }) {
    return useMemo(() => {
        const rows = payload.labels.flatMap((quarter, i) =>
            payload.series.map((s) => ({ quarter, valor: s.data[i], serie: s.label })),
        );
        return defineChart({
            marks: [barY(rows, { x: 'quarter', y: 'valor', fill: 'serie' })],
            scales: {
                x: { scale: scaleBand, padding: 0.2 },
                y: { scale: scaleLinear, nice: true, grid: true, domain: [0, 100] },
            },
            focus: CHART_FOCUS,
            tooltip: CHART_TOOLTIP,
        });
    }, [payload]);
}

/* ---------- YOY Product Lines (barY) ---------- */
function useProductChart(data: Array<{ label: string; value: number }>) {
    return useMemo(
        () =>
            defineChart({
                marks: [barY(data, { x: 'label', y: 'value' })],
                scales: {
                    x: { scale: scaleBand, padding: 0.2 },
                    y: { scale: scaleLinear, nice: true, grid: true, domain: [0, 160] },
                },
                focus: CHART_FOCUS,
                tooltip: CHART_TOOLTIP,
            }),
        [data],
    );
}

/* ---------- Monthly Revenue (lineY) ---------- */
function useMonthlyChart(data: Array<{ label: string; value: number }>) {
    return useMemo(
        () =>
            defineChart({
                marks: [lineY(data, { x: 'label', y: 'value' })],
                scales: {
                    x: { scale: scaleBand, padding: 0.2 },
                    y: { scale: scaleLinear, nice: true, grid: true, domain: [20, 55] },
                },
                focus: CHART_FOCUS,
                tooltip: CHART_TOOLTIP,
            }),
        [data],
    );
}

/* ---------- Retail Channels (barY) ---------- */
function useRetailChart(data: Array<{ label: string; value: number }>) {
    return useMemo(
        () =>
            defineChart({
                marks: [barY(data, { x: 'label', y: 'value' })],
                scales: {
                    x: { scale: scaleBand, padding: 0.2 },
                    y: { scale: scaleLinear, nice: true, grid: true, domain: [0, 50] },
                },
                focus: CHART_FOCUS,
                tooltip: CHART_TOOLTIP,
            }),
        [data],
    );
}

export default function Dashboard() {
    const { kpis, regionalSales, marketShare, priceBandMix, productLines, monthlyRevenue, retailChannels } =
        usePage<any>().props;

    const kpiItems = (kpis || []).map((k: any, i: number) => ({
        ...k,
        id: i,
        icon: iconMap[k.icon] || null,
    }));

    const regional = useRegionalChart(regionalSales || []);
    const share = useShareChart(marketShare || []);
    const priceBand = usePriceBandChart(
        priceBandMix || { labels: [], series: [] },
    );
    const product = useProductChart(productLines || []);
    const monthly = useMonthlyChart(monthlyRevenue || []);
    const retail = useRetailChart(retailChannels || []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                <PageTitle
                    title="Dashboard de Vendas"
                    subtitle="Aura Tech • FY2026 — dados mockados"
                    actions={
                        <Badge variant="outline" className="text-xs font-medium">FY2026</Badge>
                    }
                />

                <KpisPanel items={kpiItems} />

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="border-sidebar-border/70 shadow-sm dark:bg-slate-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Vendas Regionais ($M)</CardTitle>
                            <CardDescription>Distribuição por região — FY2026</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64"><Chart definition={regional} height={256} ariaLabel="Regional Sales" /></div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 shadow-sm dark:bg-slate-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Share de Mercado (%)</CardTitle>
                            <CardDescription>Aura Tech lidera com 24,6%</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64"><Chart definition={share} height={256} ariaLabel="Market Share" /></div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 shadow-sm dark:bg-slate-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Mix de Faixa de Preço (%)</CardTitle>
                            <CardDescription>Premium / Mid / Entry — por trimestre</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64"><Chart definition={priceBand} height={256} ariaLabel="Price Band Mix" /></div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 shadow-sm dark:bg-slate-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Performance por Linha ($M)</CardTitle>
                            <CardDescription>Crescimento YoY por categoria</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64"><Chart definition={product} height={256} ariaLabel="Product Lines" /></div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 shadow-sm dark:bg-slate-900 lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Trajetória Mensal ($M)</CardTitle>
                            <CardDescription>Pico em Dezembro ($48,0M)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72"><Chart definition={monthly} height={288} ariaLabel="Monthly Revenue" /></div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 shadow-sm dark:bg-slate-900 lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Canais de Varejo (%)</CardTitle>
                            <CardDescription>Direct E-Com lidera com 38%</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64"><Chart definition={retail} height={256} ariaLabel="Retail Channels" /></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
