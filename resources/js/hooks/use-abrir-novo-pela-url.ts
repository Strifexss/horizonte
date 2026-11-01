import { useEffect, useRef } from 'react';

export const PARAMETRO_NOVO = 'novo';

/** Chama `abrir` uma vez quando a página chega com `?novo=1` (atalhos do Início) e tira o parâmetro da URL. */
export function useAbrirNovoPelaUrl(abrir: () => void): void {
    const abrirRef = useRef(abrir);
    abrirRef.current = abrir;

    useEffect(() => {
        const url = new URL(window.location.href);

        if (!url.searchParams.has(PARAMETRO_NOVO)) {
            return;
        }

        url.searchParams.delete(PARAMETRO_NOVO);
        window.history.replaceState(window.history.state, '', url.toString());
        abrirRef.current();
    }, []);
}
