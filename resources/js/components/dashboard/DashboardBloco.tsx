import { Deferred } from '@inertiajs/react';
import type { ReactElement } from 'react';

type DashboardBlocoProps = {
    data: string;
    carregando: boolean;
    fallback: ReactElement;
    children: ReactElement;
};

/**
 * Bloco deferred do Dashboard que também volta ao skeleton enquanto a sua prop é recarregada
 * (ex.: ao trocar o Período de referência), em vez de manter o dado antigo na tela.
 */
export default function DashboardBloco({ data, carregando, fallback, children }: DashboardBlocoProps) {
    if (carregando) {
        return fallback;
    }

    return (
        <Deferred data={data} fallback={fallback}>
            {children}
        </Deferred>
    );
}
