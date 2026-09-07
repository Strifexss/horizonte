import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React, { useMemo } from 'react';
import { PageTitle, KpisPanel } from '@/components/padrões';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, Percent, Tag, Store, ShoppingCart, PieChart } from 'lucide-react';
import RaioXExecutivoTopo from '@/components/dashboardFinanceiro/raioxexecutivo';
import TermometroAporteSobra from '@/components/dashboardFinanceiro/termometroAporte';
import ProjecaoSobraFimMes from '@/components/dashboardFinanceiro/projecaoSobra';
import AlertaVazamentos from '@/components/dashboardFinanceiro/alertavazamentos';
import AceleradorPatrimonio from '@/components/dashboardFinanceiro/aceleradorPatrimonio';

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


export default function Dashboard() {
    const { kpis, regionalSales, marketShare, priceBandMix, productLines, monthlyRevenue, retailChannels } =
        usePage<any>().props;

    const kpiItems = (kpis || []).map((k: any, i: number) => ({
        ...k,
        id: i,
        icon: iconMap[k.icon] || null,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                <PageTitle
                    title="Horizonte Financeiro"
                />

                {/* <KpisPanel items={kpiItems} /> */}
                <RaioXExecutivoTopo />
                <TermometroAporteSobra />
                <ProjecaoSobraFimMes />
                <AceleradorPatrimonio />
                <AlertaVazamentos />

            </div>
        </AppLayout>
    );
}
