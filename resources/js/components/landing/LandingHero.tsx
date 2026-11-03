import HorizonteIlustracao from '@/components/horizonte-ilustracao';
import LandingPrint from '@/components/landing/LandingPrint';
import { branding } from '@/lib/branding';
import { PlayCircle } from 'lucide-react';

type LandingHeroProps = {
    criarContaHref: string;
};

export default function LandingHero({ criarContaHref }: LandingHeroProps) {
    return (
        <section id="topo">
            <div className="relative isolate overflow-hidden bg-[#061a33] text-white">
                {/* Ancorada pela linha do horizonte (y=500 de 720 no desenho): o sol nasce logo abaixo dos botões em qualquer largura. */}
                <div className="absolute inset-x-0 bottom-24 -z-10 aspect-[600/720] translate-y-[30.56%] sm:bottom-32 md:bottom-36 lg:bottom-40">
                    <HorizonteIlustracao className="h-full w-full" />
                </div>
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pt-12 pb-48 text-center sm:px-6 sm:pt-16 sm:pb-64 md:pb-[19rem] lg:pb-[23rem] xl:pb-[26rem] 2xl:pb-[29rem]">
                    <div className="flex flex-col items-center gap-3">
                        <img src={branding.icone} alt="" width={80} height={80} className="size-16 rounded-2xl ring-1 ring-white/25 sm:size-20" />
                        <span className="text-xl font-semibold tracking-[0.35em] sm:text-2xl">HORIZONTE</span>
                    </div>
                    <span className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-sm text-sky-100">
                        No computador e no celular
                    </span>
                    <h1 className="max-w-4xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                        Enxergue o seu futuro <span className="text-blue-400">com clareza.</span>
                    </h1>
                    <p className="max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
                        Chega de planilhas que cansam e gráficos que confundem. O Horizonte organiza o seu dinheiro em uma visão simples, para você
                        decidir com calma e caminhar com liberdade rumo ao que importa.
                    </p>
                    <div className="flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center sm:gap-3.5">
                        <a
                            href={criarContaHref}
                            className="bg-primary text-primary-foreground inline-flex min-h-13 items-center justify-center rounded-xl px-7 text-[17px] font-semibold hover:bg-blue-700"
                        >
                            Criar conta gratuita
                        </a>
                        <a
                            href="#copiloto"
                            className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-xl border border-white/30 bg-white/10 px-7 text-[17px] font-medium text-white hover:bg-white/15"
                        >
                            <PlayCircle aria-hidden="true" className="size-5 text-sky-300" />
                            Ver o sistema
                        </a>
                    </div>
                </div>
            </div>
            <div className="relative mx-auto -mt-24 max-w-6xl px-4 sm:-mt-32 sm:px-6 md:-mt-36 lg:-mt-40">
                <LandingPrint
                    priority
                    src="/images/landing/inicio.webp"
                    alt="Tela Início do Horizonte com atalhos para nova venda, resumo do dia e primeiros passos"
                    celular={{ src: '/images/landing/celular/inicio.webp', alt: 'Tela Início do Horizonte no celular' }}
                    className="mx-auto w-full max-w-5xl pb-10"
                />
            </div>
        </section>
    );
}
