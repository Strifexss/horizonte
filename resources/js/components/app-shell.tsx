import { SidebarProvider } from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

function preferenciaDaSidebar(): boolean {
    return typeof window === 'undefined' ? true : localStorage.getItem('sidebar') !== 'false';
}

function estaNoDashboard(url: string): boolean {
    return url.split('?')[0] === '/dashboard';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const noDashboard = estaNoDashboard(usePage().url);
    const [isOpen, setIsOpen] = useState(() => (noDashboard ? false : preferenciaDaSidebar()));

    useEffect(() => {
        if (noDashboard) {
            setIsOpen(false);

            return;
        }

        setIsOpen(preferenciaDaSidebar());
    }, [noDashboard]);

    const handleSidebarChange = (open: boolean) => {
        setIsOpen(open);

        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar', String(open));
        }
    };

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return (
        <SidebarProvider defaultOpen={isOpen} open={isOpen} onOpenChange={handleSidebarChange}>
            {children}
        </SidebarProvider>
    );
}
