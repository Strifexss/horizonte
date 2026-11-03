import { LandingCelular } from '@/components/landing/LandingPrint';
import { Check, Monitor, Smartphone } from 'lucide-react';

const vantagens = [
    'Todas as funcionalidades nos dois: vendas, financeiro, dashboard, Copiloto, Menu Board e cadastros',
    'Telas pensadas para cada um: atalhos de teclado no computador, toque e etapas no celular',
    'Mesma conta e os mesmos dados, onde você estiver',
    'Sem instalar nada: abre direto no navegador',
];

const telas = [
    { src: '/images/landing/celular/venda.webp', alt: 'Nova Venda no celular, com produtos no carrinho', rotulo: 'Vender' },
    { src: '/images/landing/celular/inicio.webp', alt: 'Início no celular, com atalhos e primeiros passos', rotulo: 'Acompanhar' },
    { src: '/images/landing/celular/extrato.webp', alt: 'Extrato no celular, com lançamentos e totais', rotulo: 'Controlar' },
];

export default function LandingDispositivos() {
    return (
        <section id="celular" className="scroll-mt-16 border-t border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#030a1c]">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:flex-row lg:gap-16">
                <div className="flex w-full flex-col gap-5 lg:flex-1">
                    <span className="text-primary inline-flex items-center gap-2 self-start rounded-full border border-blue-600/30 bg-blue-600/10 px-3.5 py-1.5 text-sm font-semibold dark:text-blue-400">
                        <Monitor aria-hidden="true" className="size-4" />
                        <Smartphone aria-hidden="true" className="size-4" />
                        Computador e celular
                    </span>
                    <h2 className="text-3xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">
                        No balcão, no escritório <span className="text-primary dark:text-blue-400">ou no bolso.</span>
                    </h2>
                    <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                        O Horizonte foi feito para funcionar inteiro no celular, não só para consultar. Venda, lance despesas, veja o dashboard e peça
                        uma análise ao Copiloto de onde estiver.
                    </p>
                    <ul className="flex flex-col gap-3 text-slate-700 dark:text-slate-300">
                        {vantagens.map((vantagem) => (
                            <li key={vantagem} className="flex gap-2.5">
                                <Check aria-hidden="true" className="mt-0.5 size-5 flex-none text-emerald-600 dark:text-emerald-400" />
                                {vantagem}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="grid w-full max-w-xl grid-cols-3 items-end gap-3 sm:gap-5 lg:flex-1">
                    {telas.map((tela, indice) => (
                        <figure key={tela.src} className={indice === 1 ? 'flex flex-col gap-3 sm:-translate-y-8' : 'flex flex-col gap-3'}>
                            <LandingCelular src={tela.src} alt={tela.alt} />
                            <figcaption className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300">{tela.rotulo}</figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
