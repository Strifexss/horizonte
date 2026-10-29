import type { TemaMenuBoard } from '@/components/menu-boards/types';

export type TemaInfo = {
    id: TemaMenuBoard;
    nome: string;
    descricao: string;
    amostra: {
        fundo: string;
        barra: string;
        card: string;
    };
};

export const TEMAS: TemaInfo[] = [
    {
        id: 'dark',
        nome: 'Dark',
        descricao: 'Fundo escuro, preços em âmbar. Ideal para TV.',
        amostra: { fundo: 'bg-[#0b1220]', barra: 'bg-amber-500', card: 'bg-[#13213a]' },
    },
    {
        id: 'clean',
        nome: 'Clean',
        descricao: 'Fundo claro, tipografia em destaque.',
        amostra: { fundo: 'bg-slate-50 border border-slate-200', barra: 'bg-slate-900', card: 'bg-white border border-slate-200' },
    },
    {
        id: 'vibrante',
        nome: 'Vibrante',
        descricao: 'Vermelho e amarelo, alto contraste.',
        amostra: { fundo: 'bg-red-700', barra: 'bg-yellow-400', card: 'bg-red-800' },
    },
    {
        id: 'rustico',
        nome: 'Rústico',
        descricao: 'Marrom e laranja, letra serifada.',
        amostra: { fundo: 'bg-[#2b1d14]', barra: 'bg-[#e07a2e]', card: 'bg-[#3d2a1e]' },
    },
    {
        id: 'natural',
        nome: 'Natural',
        descricao: 'Verde-escuro e verde-limão.',
        amostra: { fundo: 'bg-[#14301f]', barra: 'bg-lime-400', card: 'bg-[#1d4029]' },
    },
    {
        id: 'doce',
        nome: 'Doce',
        descricao: 'Rosa-claro, letra arredondada.',
        amostra: { fundo: 'bg-rose-50 border border-pink-200', barra: 'bg-pink-600', card: 'bg-white border border-pink-200' },
    },
    {
        id: 'oceano',
        nome: 'Oceano',
        descricao: 'Azul-marinho e verde-água.',
        amostra: { fundo: 'bg-[#0b2545]', barra: 'bg-teal-400', card: 'bg-[#13315c]' },
    },
    {
        id: 'premium',
        nome: 'Premium',
        descricao: 'Preto e dourado, letra elegante.',
        amostra: { fundo: 'bg-neutral-950', barra: 'bg-[#d4af37]', card: 'bg-[#1f1f1f]' },
    },
];

export function nomeDoTema(tema: TemaMenuBoard): string {
    return TEMAS.find((item) => item.id === tema)?.nome ?? tema;
}
