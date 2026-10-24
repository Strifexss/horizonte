import TvPareamentoForm from '@/components/tv/TvPareamentoForm';
import { branding } from '@/lib/branding';
import { Head } from '@inertiajs/react';

export default function TvPareamentoPage() {
    return (
        <>
            <Head title="Conectar TV" />
            <main className="relative flex h-screen w-screen flex-col items-center overflow-hidden bg-[#050b16] px-[5vw] py-[3.75vw] font-sans text-slate-50">
                <header className="flex w-full items-center justify-between">
                    <img src={branding.completaFundoEscuro} alt="Horizonte" className="h-[2.9vw] min-h-8 w-auto" />
                    <span className="text-[1.05vw] text-slate-400">TV não conectada</span>
                </header>

                <TvPareamentoForm />

                <footer className="flex w-full justify-between text-[1.05vw] text-slate-500">
                    <span>Salve este endereço como página inicial da TV</span>
                    <span>Use os números do controle remoto ou o teclado na tela</span>
                </footer>
            </main>
        </>
    );
}
