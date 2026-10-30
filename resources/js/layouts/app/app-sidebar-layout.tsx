import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import EmpresaNomeModal from '@/components/empresa/EmpresaNomeModal';
import NovidadesPopup from '@/components/novidades/NovidadesPopup';
import ToastFlash from '@/components/toast-flash';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    const nomeConfirmado = usePage<SharedData>().props.empresa?.nome_confirmado !== false;

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <ToastFlash />
            {nomeConfirmado ? <NovidadesPopup /> : <EmpresaNomeModal />}
        </AppShell>
    );
}
