import { branding } from '@/lib/branding';

type LandingHeaderProps = {
    entrarHref: string;
    criarContaHref: string;
};

const secoes = [
    { href: '#copiloto', rotulo: 'Copiloto IA' },
    { href: '#funcionalidades', rotulo: 'Funcionalidades' },
    { href: '#segmentos', rotulo: 'Segmentos' },
];

export default function LandingHeader({ entrarHref, criarContaHref }: LandingHeaderProps) {
    return (
        <header className="border-b border-slate-200 dark:border-slate-800">
            <nav aria-label="Principal" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
                <a href="#topo" className="flex items-center">
                    <img src={branding.completaFundoClaro} alt="Horizonte" className="h-8 w-auto dark:hidden" />
                    <img src={branding.completaFundoEscuro} alt="Horizonte" className="hidden h-8 w-auto dark:block" />
                </a>
                <div className="hidden items-center gap-7 text-[15px] md:flex">
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
                <div className="flex items-center gap-2">
                    <a
                        href={entrarHref}
                        className="hover:text-primary inline-flex min-h-11 items-center px-4 text-[15px] font-medium text-slate-700 dark:text-slate-200"
                    >
                        Entrar
                    </a>
                    <a
                        href={criarContaHref}
                        className="bg-primary text-primary-foreground inline-flex min-h-11 items-center rounded-lg px-5 text-[15px] font-semibold hover:bg-blue-700"
                    >
                        Começar agora
                    </a>
                </div>
            </nav>
        </header>
    );
}
