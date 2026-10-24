import type { TemaMenuBoard } from '@/components/menu-boards/types';

export type TemaInfo = {
    id: TemaMenuBoard;
    nome: string;
    descricao: string;
    amostra: {
        fundo: string;
        barra: string;
        grande: string;
        pequeno: string;
    };
};

export const TEMAS: TemaInfo[] = [
    {
        id: 'dark',
        nome: 'Dark Mode Sofisticado',
        descricao: 'Fundo escuro, preços em âmbar. Ideal para TV.',
        amostra: { fundo: 'bg-[#0b1220]', barra: 'bg-amber-500', grande: 'bg-[#13213a]', pequeno: 'bg-slate-800' },
    },
    {
        id: 'clean',
        nome: 'Clean Minimalista',
        descricao: 'Fundo claro, tipografia em destaque.',
        amostra: { fundo: 'bg-slate-50', barra: 'bg-slate-900', grande: 'bg-white', pequeno: 'bg-slate-200' },
    },
    {
        id: 'vibrante',
        nome: 'Fast Food Vibrante',
        descricao: 'Vermelho e amarelo, alto contraste.',
        amostra: { fundo: 'bg-red-700', barra: 'bg-yellow-400', grande: 'bg-red-800', pequeno: 'bg-red-900' },
    },
];

export function nomeDoTema(tema: TemaMenuBoard): string {
    return TEMAS.find((item) => item.id === tema)?.nome ?? tema;
}
