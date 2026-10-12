import DashboardGrafico from '@/components/dashboard/DashboardGrafico';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import type { SaldoMensal } from '@/components/dashboard/types';
import { PageTitle } from '@/components/padrões';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Deferred, Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

type DashboardPageProps = {
    ano: number;
    saldos?: SaldoMensal[];
};

export default function Dashboard({ ano, saldos }: DashboardPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                <PageTitle title="Saldo mensal" subtitle={String(ano)} />
                <Deferred data="saldos" fallback={<DashboardSkeleton />}>
                    <DashboardGrafico ano={ano} saldos={saldos ?? []} />
                </Deferred>
            </div>
        </AppLayout>
    );
}
