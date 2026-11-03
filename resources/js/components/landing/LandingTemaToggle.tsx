import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Alterna claro/escuro na landing. Não usa `useAppearance` porque aquele módulo lê `window` ao ser importado,
 * o que quebra o SSR; aqui o navegador só é tocado depois de montar. Grava a mesma chave `appearance` do sistema.
 */
export default function LandingTemaToggle() {
    const [escuro, setEscuro] = useState(false);

    useEffect(() => {
        setEscuro(document.documentElement.classList.contains('dark'));
    }, []);

    const alternar = () => {
        const proximo = !escuro;
        setEscuro(proximo);
        document.documentElement.classList.toggle('dark', proximo);
        localStorage.setItem('appearance', proximo ? 'dark' : 'light');
    };

    return (
        <button
            type="button"
            onClick={alternar}
            aria-label={escuro ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            className="hover:text-primary inline-flex size-10 flex-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400"
        >
            {escuro ? <Sun aria-hidden="true" className="size-5" /> : <Moon aria-hidden="true" className="size-5" />}
        </button>
    );
}
