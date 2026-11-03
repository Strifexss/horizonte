type LandingRodapeProps = {
    entrarHref: string;
    criarContaHref: string;
};

export default function LandingRodape({ entrarHref, criarContaHref }: LandingRodapeProps) {
    return (
        <>
            <section className="relative overflow-hidden border-t border-slate-200 dark:border-slate-800">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-[60%] left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(37,99,235,0.2),transparent)] dark:bg-[radial-gradient(closest-side,rgba(37,99,235,0.35),transparent)]"
                />
                <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-28 text-center sm:px-6 md:py-32">
                    <h2 className="text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl">
                        O amanhã começa com <span className="text-primary dark:text-blue-400">uma decisão</span> hoje.
                    </h2>
                    <p className="max-w-xl text-lg text-slate-600 dark:text-slate-300">
                        Assuma o controle do seu negócio em poucos minutos. Seu novo horizonte está a um clique de distância.
                    </p>
                    <a
                        href={criarContaHref}
                        className="bg-primary text-primary-foreground inline-flex min-h-14 items-center rounded-xl px-8 text-lg font-semibold hover:bg-blue-700"
                    >
                        Criar minha conta gratuita
                    </a>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Já tem conta?{' '}
                        <a href={entrarHref} className="text-primary font-semibold hover:underline dark:text-blue-400">
                            Entrar
                        </a>
                    </p>
                </div>
            </section>
            <footer className="border-t border-slate-200 dark:border-slate-800">
                <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-6 px-4 py-10 text-sm sm:px-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-[17px] font-semibold">Horizonte</span>
                        <span className="text-slate-600 dark:text-slate-400">Clareza hoje. Liberdade amanhã.</span>
                    </div>
                    <nav aria-label="Rodapé" className="flex flex-wrap gap-x-8 gap-y-3 text-slate-600 dark:text-slate-300">
                        <a href="#copiloto" className="hover:text-primary">
                            Copiloto IA
                        </a>
                        <a href="#funcionalidades" className="hover:text-primary">
                            Funcionalidades
                        </a>
                        <a href="#segmentos" className="hover:text-primary">
                            Segmentos
                        </a>
                        <a href={entrarHref} className="hover:text-primary">
                            Entrar
                        </a>
                    </nav>
                </div>
                <div className="mx-auto max-w-6xl px-4 pb-8 text-[13px] text-slate-500 sm:px-6 dark:text-slate-400">
                    © {new Date().getFullYear()} Horizonte. Todos os direitos reservados.
                </div>
            </footer>
        </>
    );
}
