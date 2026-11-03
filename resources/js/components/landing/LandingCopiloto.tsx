import LandingPrint from '@/components/landing/LandingPrint';
import { Sparkles } from 'lucide-react';

type LandingCopilotoProps = {
    criarContaHref: string;
};

const passos = [
    { titulo: 'Resumo do mês em uma frase', texto: 'Como o negócio foi, o que melhorou e onde está o risco, sem precisar abrir gráfico nenhum.' },
    {
        titulo: 'Insights com valor em reais',
        texto: 'Crescimento, custos, alertas e sinais positivos, cada um com o impacto estimado e o que fazer.',
    },
    { titulo: 'Você decide: “Vou fazer” ou dispensar', texto: 'Monte sua lista de ações. O que não se aplica ao seu negócio sai da frente.' },
    { titulo: 'Ele confere se deu certo', texto: 'No mês seguinte, o Copiloto mostra o resultado de cada ação que você colocou em prática.' },
];

export default function LandingCopiloto({ criarContaHref }: LandingCopilotoProps) {
    return (
        <section id="copiloto" className="relative scroll-mt-16 overflow-hidden border-t border-slate-200 dark:border-slate-800">
            <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-24 md:py-28">
                <div className="flex flex-wrap items-end justify-between gap-6 sm:gap-10">
                    <div className="flex max-w-2xl flex-col gap-4">
                        <span className="text-primary inline-flex items-center gap-2 self-start rounded-full border border-blue-600/30 bg-blue-600/10 px-3.5 py-1.5 text-sm font-semibold dark:text-blue-400">
                            <Sparkles aria-hidden="true" className="size-4" />
                            Copiloto · Inteligência artificial
                        </span>
                        <h2 className="text-3xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">
                            Um analista financeiro <span className="text-primary dark:text-blue-400">trabalhando para você.</span>
                        </h2>
                        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                            Um clique em “Analisar com IA” e o Copiloto lê suas vendas, receitas e despesas, compara com os meses anteriores e diz, em
                            português claro, o que fazer para lucrar mais.
                        </p>
                    </div>
                    <a
                        href={criarContaHref}
                        className="bg-primary text-primary-foreground inline-flex min-h-13 w-full items-center justify-center rounded-xl px-7 text-[17px] font-semibold hover:bg-blue-700 sm:w-auto"
                    >
                        Quero o Copiloto no meu negócio
                    </a>
                </div>

                <LandingPrint
                    src="/images/landing/copiloto.webp"
                    alt="Análise do Copiloto: resumo do mês, resultado de ação anterior e insights de custos, crescimento, sinal positivo e alerta"
                    recorteMobile="aspect-[4/5] object-[22%_0%]"
                    className="shadow-blue-600/20"
                />
                <p className="-mt-7 text-xs text-slate-500 dark:text-slate-400">Valores ilustrativos de uma empresa de demonstração.</p>

                <ol className="grid gap-6 sm:grid-cols-2">
                    {passos.map((passo, indice) => (
                        <li key={passo.titulo} className="flex gap-3.5">
                            <span className="bg-primary text-primary-foreground flex size-8 flex-none items-center justify-center rounded-full text-[15px] font-bold">
                                {indice + 1}
                            </span>
                            <div className="flex flex-col gap-1">
                                <span className="text-[17px] font-semibold">{passo.titulo}</span>
                                <span className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{passo.texto}</span>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
