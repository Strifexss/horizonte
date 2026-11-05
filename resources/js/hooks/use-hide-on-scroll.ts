import { useCallback, useRef, useState } from 'react';

const SCROLL_DELTA_PX = 8;
const TOP_ZONE_PX = 48;
/** Duração da animação do cabeçalho: a rolagem ajustada pelo navegador nesse tempo é ignorada. */
const SETTLE_MS = 250;

/**
 * Esconde um cabeçalho enquanto o usuário rola para baixo e mostra de novo ao rolar para cima.
 * Perto do topo ele fica sempre visível. Ligue `onScroll` no container que rola.
 */
export function useHideOnScroll() {
    const [hidden, setHidden] = useState(false);
    const lastScrollTop = useRef(0);
    const settleUntil = useRef(0);

    const onScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
        const scrollTop = event.currentTarget.scrollTop;

        // Recolher o cabeçalho muda a altura da área que rola; sem isso, perto do fim ele piscaria.
        if (Date.now() < settleUntil.current) {
            lastScrollTop.current = scrollTop;
            return;
        }

        const delta = scrollTop - lastScrollTop.current;
        let next: boolean;

        if (scrollTop <= TOP_ZONE_PX) {
            next = false;
        } else if (delta > SCROLL_DELTA_PX) {
            next = true;
        } else if (delta < -SCROLL_DELTA_PX) {
            next = false;
        } else {
            return;
        }

        lastScrollTop.current = scrollTop;
        setHidden((current) => {
            if (current !== next) {
                settleUntil.current = Date.now() + SETTLE_MS;
            }

            return next;
        });
    }, []);

    const reset = useCallback(() => {
        lastScrollTop.current = 0;
        setHidden(false);
    }, []);

    return { hidden, onScroll, reset };
}
