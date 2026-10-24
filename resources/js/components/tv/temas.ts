import type { TemaMenuBoard } from '@/components/menu-boards/types';

export type EstiloTv = {
    fundo: string;
    texto: string;
    suave: string;
    regua: string;
    peso: string;
    cardDestaque: string;
    textoDestaque: string;
    suaveDestaque: string;
    precoDestaque: string;
    selo: string;
    card: string;
    textoCard: string;
    suaveCard: string;
    precoCard: string;
    sync: string;
};

export const ESTILOS_TV: Record<TemaMenuBoard, EstiloTv> = {
    dark: {
        fundo: 'bg-[#070d1a]',
        texto: 'text-slate-50',
        suave: 'text-slate-400',
        regua: 'bg-amber-500',
        peso: 'font-semibold',
        cardDestaque: 'bg-[#0f1d33] border-amber-500/35',
        textoDestaque: 'text-white',
        suaveDestaque: 'text-[#a3b3c9]',
        precoDestaque: 'text-amber-400',
        selo: 'bg-amber-500 text-[#082845]',
        card: 'bg-[#0c1626] border-slate-800',
        textoCard: 'text-slate-50',
        suaveCard: 'text-slate-400',
        precoCard: 'text-amber-400',
        sync: 'bg-slate-800 text-slate-50',
    },
    clean: {
        fundo: 'bg-slate-50',
        texto: 'text-slate-900',
        suave: 'text-slate-600',
        regua: 'bg-slate-900',
        peso: 'font-semibold',
        cardDestaque: 'bg-white border-slate-200',
        textoDestaque: 'text-slate-900',
        suaveDestaque: 'text-slate-600',
        precoDestaque: 'text-amber-700',
        selo: 'bg-slate-900 text-white',
        card: 'bg-white border-slate-200',
        textoCard: 'text-slate-900',
        suaveCard: 'text-slate-600',
        precoCard: 'text-slate-900',
        sync: 'bg-slate-200 text-slate-900',
    },
    vibrante: {
        fundo: 'bg-red-700',
        texto: 'text-white',
        suave: 'text-red-200',
        regua: 'bg-yellow-300',
        peso: 'font-bold',
        cardDestaque: 'bg-yellow-400 border-yellow-400',
        textoDestaque: 'text-stone-900',
        suaveDestaque: 'text-stone-700',
        precoDestaque: 'text-red-800',
        selo: 'bg-red-800 text-white',
        card: 'bg-red-800 border-red-900',
        textoCard: 'text-white',
        suaveCard: 'text-red-200',
        precoCard: 'text-yellow-300',
        sync: 'bg-red-900 text-white',
    },
};

export type ProdutoNaTv = {
    id: number;
    nome: string;
    descricao: string | null;
    preco: string;
    foto_url: string | null;
};

export type TvBoard = {
    nome: string;
    tema: TemaMenuBoard;
    destaques: ProdutoNaTv[];
    itens: ProdutoNaTv[];
};

export function formatarPrecoTv(valor: string): string {
    return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
