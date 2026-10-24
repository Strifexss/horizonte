import type { ReactNode } from 'react';
import { CATEGORIAS_NOVIDADE, type NovidadeCategoria } from './types';

type Tom = 'ambar' | 'verde' | 'azul' | 'vermelho' | 'neutro';

const CORES: Record<Tom, string> = {
    ambar: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    verde: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300',
    azul: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    vermelho: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    neutro: 'bg-muted text-muted-foreground',
};

const TOM_DA_CATEGORIA: Record<NovidadeCategoria, Tom> = {
    novo: 'ambar',
    melhoria: 'azul',
    correcao: 'vermelho',
};

export function NovidadesSelo({ children, tom }: { children: ReactNode; tom: Tom }) {
    return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${CORES[tom]}`}>{children}</span>;
}

export function NovidadeCategoriaSelo({ categoria }: { categoria: NovidadeCategoria }) {
    return <NovidadesSelo tom={TOM_DA_CATEGORIA[categoria]}>{CATEGORIAS_NOVIDADE[categoria]}</NovidadesSelo>;
}
