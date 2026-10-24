import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { CreditCard, FileText, Landmark, LayoutGrid, Package, ShoppingCart, Tv } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Extrato',
        url: '/extrato',
        icon: FileText,
    },
    {
        title: 'Vendas',
        url: '/vendas',
        icon: ShoppingCart,
    },
    {
        title: 'Produtos',
        url: '/produtos',
        icon: Package,
    },
    {
        title: 'Contas',
        url: '/contas',
        icon: Landmark,
    },
    {
        title: 'Formas de pagamento',
        url: '/formas-pagamento',
        icon: CreditCard,
    },
    {
        title: 'Menu Board',
        url: '/menu-boards',
        icon: Tv,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/extrato" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
