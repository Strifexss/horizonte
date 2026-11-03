import LandingPrint from '@/components/landing/LandingPrint';
import { PlayCircle } from 'lucide-react';

type LandingHeroProps = {
    criarContaHref: string;
};

export default function LandingHero({ criarContaHref }: LandingHeroProps) {
    return (
        <section id="topo" className="relative overflow-hidden">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-[520px] left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(37,99,235,0.22),rgba(56,189,248,0.06)_55%,transparent)] dark:bg-[radial-gradient(closest-side,rgba(37,99,235,0.35),rgba(56,189,248,0.08)_55%,transparent)]"
            />
            <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-7 px-4 pt-20 text-center sm:px-6 md:pt-24">
                <span className="rounded-full border border-blue-600/30 bg-sky-600/10 px-3.5 py-1.5 text-sm text-sky-700 dark:border-blue-400/35 dark:text-sky-300">
                    Seu dinheiro, sem ruído
                </span>
                <h1 className="max-w-4xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                    Enxergue o seu futuro <span className="text-primary dark:text-blue-400">com clareza.</span>
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-400">
                    Chega de planilhas que cansam e gráficos que confundem. O Horizonte organiza o seu dinheiro em uma visão simples, para você
                    decidir com calma e caminhar com liberdade rumo ao que importa.
                </p>
                <div className="flex flex-wrap justify-center gap-3.5">
                    <a
                        href={criarContaHref}
                        className="bg-primary text-primary-foreground inline-flex min-h-13 items-center rounded-xl px-7 text-[17px] font-semibold hover:bg-blue-700"
                    >
                        Criar conta gratuita
                    </a>
                    <a
                        href="#copiloto"
                        className="inline-flex min-h-13 items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-7 text-[17px] font-medium text-slate-900 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                        <PlayCircle aria-hidden="true" className="size-5 text-sky-600 dark:text-sky-400" />
                        Ver o sistema
                    </a>
                </div>
                <LandingPrint
                    priority
                    src="/images/landing/inicio.webp"
                    alt="Tela Início do Horizonte com atalhos para nova venda, resumo do dia e primeiros passos"
                    className="mt-8 w-full max-w-5xl rounded-b-none border-b-0"
                />
            </div>
        </section>
    );
}
