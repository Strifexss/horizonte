import { AdminHeader } from '@/components/admin-header';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import ToastFlash from '@/components/toast-flash';
import { type ReactNode } from 'react';

type AdminLayoutProps = {
    children: ReactNode;
    usuariosUrl: string;
};

export default function AdminLayout({ children, usuariosUrl }: AdminLayoutProps) {
    return (
        <AppShell variant="header">
            <AdminHeader usuariosUrl={usuariosUrl} />
            <AppContent>{children}</AppContent>
            <ToastFlash />
        </AppShell>
    );
}
