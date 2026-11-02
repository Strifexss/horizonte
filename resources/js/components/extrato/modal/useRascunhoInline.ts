import { useEffect, useRef, useState } from 'react';

export type FocoRascunho = 'nome' | 'valor';

const ATRASO_FOCO_MS = 50;

/**
 * Rascunho de cadastro rápido dentro do lançamento (produto, funcionário, fornecedor, categoria).
 * `nome === null` significa que não há rascunho aberto; o foco é aplicado depois que o painel monta.
 */
export function useRascunhoInline() {
    const [nome, setNome] = useState<string | null>(null);
    const [valor, setValor] = useState('');
    const [foco, setFoco] = useState<FocoRascunho | null>(null);
    const nomeRef = useRef<HTMLInputElement | null>(null);
    const valorRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!foco || nome === null) {
            return;
        }

        const timer = window.setTimeout(() => {
            const el = foco === 'valor' ? valorRef.current : nomeRef.current;
            el?.focus();
            el?.select?.();
            setFoco(null);
        }, ATRASO_FOCO_MS);

        return () => window.clearTimeout(timer);
    }, [foco, nome]);

    return { nome, setNome, valor, setValor, foco, setFoco, nomeRef, valorRef };
}

export type RascunhoInline = ReturnType<typeof useRascunhoInline>;
