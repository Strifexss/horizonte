import { useCallback, useEffect, useRef, useState } from 'react';

/** Folga para arredondamento de subpixel: abaixo disso conta como "chegou ao fim". */
const FOLGA_PX = 4;

/**
 * Diz se um container que rola ainda tem conteúdo escondido abaixo e se o usuário já rolou.
 * Mede de novo ao rolar e quando o container ou o conteúdo mudam de tamanho (campos que abrem e fecham).
 */
export function useConteudoAbaixo<T extends HTMLElement>() {
    const ref = useRef<T | null>(null);
    const [temMais, setTemMais] = useState(false);
    const [jaRolou, setJaRolou] = useState(false);

    const medir = useCallback(() => {
        const el = ref.current;
        if (!el) {
            return;
        }
        setTemMais(el.scrollHeight - el.scrollTop - el.clientHeight > FOLGA_PX);
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) {
            return;
        }

        medir();
        const observador = new ResizeObserver(medir);
        observador.observe(el);
        Array.from(el.children).forEach((filho) => observador.observe(filho));
        const mutacoes = new MutationObserver(() => {
            Array.from(el.children).forEach((filho) => observador.observe(filho));
            medir();
        });
        mutacoes.observe(el, { childList: true, subtree: true });

        return () => {
            observador.disconnect();
            mutacoes.disconnect();
        };
    }, [medir]);

    const onScroll = useCallback(
        (event: React.UIEvent<T>) => {
            if (event.currentTarget.scrollTop > 0) {
                setJaRolou(true);
            }
            medir();
        },
        [medir],
    );

    /** Rola uma "página" curta para baixo, deixando um pedaço do conteúdo anterior como referência. */
    const rolarParaBaixo = useCallback(() => {
        const el = ref.current;
        el?.scrollBy({ top: el.clientHeight * 0.7, behavior: 'smooth' });
    }, []);

    return { ref, temMais, jaRolou, onScroll, rolarParaBaixo };
}
