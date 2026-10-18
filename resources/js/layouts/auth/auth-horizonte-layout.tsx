import HorizonteIlustracao from '@/components/horizonte-ilustracao';
import { branding } from '@/lib/branding';
import { Link } from '@inertiajs/react';

interface AuthHorizonteLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

export default function AuthHorizonteLayout({ children, title, description }: AuthHorizonteLayoutProps) {
    return (
        <div className="dark:bg-background flex min-h-svh items-center justify-center bg-slate-100 p-4 md:p-10">
            <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-900/10 md:min-h-[38rem] md:grid-cols-2 dark:bg-slate-900 dark:shadow-black/40">
                <div className="relative isolate flex min-h-[13rem] flex-col overflow-hidden p-6 text-white md:min-h-0 md:p-10">
                    <HorizonteIlustracao className="absolute inset-0 -z-10 h-full w-full" />

                    <Link href={route('home')} className="flex items-center gap-2 self-start">
                        <img src={branding.icone} alt="" className="size-8 rounded-md ring-1 ring-white/20" />
                        <span className="text-sm font-semibold tracking-[0.2em]">HORIZONTE</span>
                    </Link>

                    <div className="mt-16 hidden max-w-xs flex-col gap-3 md:flex">
                        <p className="text-sm text-white/80">Que bom ver você de novo</p>
                        <p className="text-4xl leading-tight font-semibold tracking-wide">BEM-VINDO</p>
                        <span className="h-1 w-12 rounded-full bg-[#f59e0b]" />
                        <p className="text-sm leading-relaxed text-white/75">Receitas, despesas e o saldo do mês num só lugar, pela competência.</p>
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-8 p-6 sm:p-10 md:px-14">
                    <div className="space-y-2 text-center">
                        <h1 className="text-2xl font-semibold text-[#082845] dark:text-white">{title}</h1>
                        <p className="text-muted-foreground text-sm">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
