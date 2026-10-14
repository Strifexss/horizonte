import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Menu, Users } from 'lucide-react';
import AppLogo from './app-logo';

type AdminHeaderProps = {
    usuariosUrl: string;
};

function pathOf(url: string): string {
    return new URL(url, window.location.origin).pathname;
}

export function AdminHeader({ usuariosUrl }: AdminHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

    const navItems: NavItem[] = [
        { title: 'Usuários', url: usuariosUrl, icon: Users },
        { title: 'Voltar ao sistema', url: route('extrato.index'), icon: ArrowLeft },
    ];

    const isActive = (item: NavItem): boolean => pathOf(item.url) === page.url.split('?')[0];

    return (
        <div className="border-sidebar-border/80 border-b">
            <div className="mx-auto flex h-16 items-center gap-2 px-4 md:max-w-7xl">
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Abrir menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="bg-sidebar flex w-64 flex-col">
                            <SheetHeader className="text-left">
                                <SheetTitle>Painel Administrativo</SheetTitle>
                            </SheetHeader>
                            <nav className="mt-4 flex flex-col gap-1 px-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.title}
                                        href={item.url}
                                        className={cn(
                                            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                                            isActive(item) ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
                                        )}
                                    >
                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                        <span>{item.title}</span>
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                <Link href={usuariosUrl} className="flex items-center">
                    <AppLogo fundo="claro" />
                </Link>

                <nav className="ml-6 hidden h-full items-center gap-1 md:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.title}
                            href={item.url}
                            className={cn(
                                'text-muted-foreground hover:text-foreground relative flex h-full items-center gap-2 px-3 text-sm font-medium',
                                isActive(item) && 'text-foreground',
                            )}
                        >
                            {item.icon && <Icon iconNode={item.icon} className="h-4 w-4" />}
                            {item.title}
                            {isActive(item) && <span className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white" />}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-10 rounded-full p-1">
                                <Avatar className="size-8 overflow-hidden rounded-full">
                                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
