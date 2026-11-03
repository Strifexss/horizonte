import LandingTemaToggle from '@/components/landing/LandingTemaToggle';
import { branding } from '@/lib/branding';

type LandingHeaderProps = {
    entrarHref: string;
    criarContaHref: string;
};

const secoes = [
    { href: '#celular', rotulo: 'No celular' },
    { href: '#copiloto', rotulo: 'Copiloto IA' },
    { href: '#funcionalidades', rotulo: 'Funcionalidades' },
    { href: '#segmentos', rotulo: 'Segmentos' },
];

export default function LandingHeader({ entrarHref, criarContaHref }: LandingHeaderProps) {
    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
            <nav aria-label="Principal" className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <a href="#topo" className="flex min-w-0 flex-none items-center" aria-label="Horizonte, voltar ao topo">
                    <img src={branding.icone} alt="" className="h-8 w-auto sm:hidden" />
                    <img src={branding.completaFundoClaro} alt="" className="hidden h-8 w-auto sm:block dark:sm:hidden" />
                    <img src={branding.completaFundoEscuro} alt="" className="hidden h-8 w-auto dark:sm:block" />
                </a>
                <div className="hidden items-center gap-7 text-[15px] lg:flex">
                    {secoes.map((secao) => (
                        <a
                            key={secao.href}
                            href={secao.href}
                            className="hover:text-primary text-slate-600 dark:text-slate-300 dark:hover:text-blue-400"
                        >
                            {secao.rotulo}
                        </a>
                    ))}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <LandingTemaToggle />
                    <a
                        href={entrarHref}
                        className="hover:text-primary inline-flex min-h-10 items-center px-2.5 text-[15px] font-medium whitespace-nowrap text-slate-700 sm:px-4 dark:text-slate-200"
                    >
                        Entrar
                    </a>
                    <a
                        href={criarContaHref}
                        className="bg-primary text-primary-foreground inline-flex min-h-10 items-center rounded-lg px-3.5 text-[15px] font-semibold whitespace-nowrap hover:bg-blue-700 sm:px-5"
                    >
                        <span className="sm:hidden">Começar</span>
                        <span className="hidden sm:inline">Começar agora</span>
                    </a>
                </div>
            </nav>
        </header>
    );
}
