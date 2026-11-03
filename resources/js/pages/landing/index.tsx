import LandingContraste from '@/components/landing/LandingContraste';
import LandingCopiloto from '@/components/landing/LandingCopiloto';
import LandingFuncionalidades from '@/components/landing/LandingFuncionalidades';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import LandingRodape from '@/components/landing/LandingRodape';
import LandingSegmentos from '@/components/landing/LandingSegmentos';
import { Head } from '@inertiajs/react';

type LandingProps = {
    links: {
        entrar: string;
        criarConta: string;
    };
};

const descricao =
    'Vendas, financeiro, dashboard, cardápio na TV e um Copiloto de IA que diz o que fazer para lucrar mais. Gestão simples para restaurantes e varejo.';

export default function Landing({ links }: LandingProps) {
    return (
        <>
            <Head title="Gestão financeira com clareza">
                <meta head-key="description" name="description" content={descricao} />
                <meta head-key="og:title" property="og:title" content="Horizonte: enxergue o seu futuro com clareza" />
                <meta head-key="og:description" property="og:description" content={descricao} />
                <meta head-key="og:image" property="og:image" content="/images/landing/copiloto.webp" />
                <meta head-key="og:type" property="og:type" content="website" />
            </Head>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                <LandingHeader entrarHref={links.entrar} criarContaHref={links.criarConta} />
                <main>
                    <LandingHero criarContaHref={links.criarConta} />
                    <LandingCopiloto criarContaHref={links.criarConta} />
                    <LandingContraste />
                    <LandingSegmentos criarContaHref={links.criarConta} />
                    <LandingFuncionalidades />
                </main>
                <LandingRodape entrarHref={links.entrar} criarContaHref={links.criarConta} />
            </div>
        </>
    );
}
