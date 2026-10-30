import type { TemaMenuBoard } from '@/components/menu-boards/types';

export type EstiloTv = {
    fonte: string;
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
    linha: string;
    foto: string;
    sync: string;
};

const SANS = 'font-sans';

export const ESTILOS_TV: Record<TemaMenuBoard, EstiloTv> = {
    dark: {
        fonte: SANS,
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
        linha: 'border-slate-800',
        foto: 'bg-[#1e2d47] text-slate-500',
        sync: 'bg-slate-800 text-slate-50',
    },
    clean: {
        fonte: SANS,
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
        linha: 'border-slate-200',
        foto: 'bg-slate-200 text-slate-500',
        sync: 'bg-slate-200 text-slate-900',
    },
    vibrante: {
        fonte: SANS,
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
        linha: 'border-red-900',
        foto: 'bg-red-800 text-red-300',
        sync: 'bg-red-900 text-white',
    },
    rustico: {
        fonte: "font-['Fraunces',Georgia,serif]",
        fundo: 'bg-[#2b1d14]',
        texto: 'text-[#f5ebdd]',
        suave: 'text-[#c9b59c]',
        regua: 'bg-[#e07a2e]',
        peso: 'font-semibold',
        cardDestaque: 'bg-[#3d2a1e] border-[#e07a2e]/45',
        textoDestaque: 'text-[#f5ebdd]',
        suaveDestaque: 'text-[#c9b59c]',
        precoDestaque: 'text-[#f0a35e]',
        selo: 'bg-[#e07a2e] text-[#2b1d14]',
        card: 'bg-[#35251a] border-[#4a3426]',
        textoCard: 'text-[#f5ebdd]',
        suaveCard: 'text-[#c9b59c]',
        precoCard: 'text-[#f0a35e]',
        linha: 'border-[#4a3426]',
        foto: 'bg-[#4a3426] text-[#c9b59c]',
        sync: 'bg-[#4a3426] text-[#f5ebdd]',
    },
    natural: {
        fonte: SANS,
        fundo: 'bg-[#14301f]',
        texto: 'text-[#f0fdf4]',
        suave: 'text-[#a7c4b0]',
        regua: 'bg-lime-400',
        peso: 'font-semibold',
        cardDestaque: 'bg-[#1d4029] border-lime-400/40',
        textoDestaque: 'text-[#f0fdf4]',
        suaveDestaque: 'text-[#a7c4b0]',
        precoDestaque: 'text-lime-300',
        selo: 'bg-lime-400 text-[#14301f]',
        card: 'bg-[#193a26] border-[#24503a]',
        textoCard: 'text-[#f0fdf4]',
        suaveCard: 'text-[#a7c4b0]',
        precoCard: 'text-lime-300',
        linha: 'border-[#24503a]',
        foto: 'bg-[#24503a] text-[#a7c4b0]',
        sync: 'bg-[#24503a] text-[#f0fdf4]',
    },
    doce: {
        fonte: "font-['Nunito',system-ui,sans-serif]",
        fundo: 'bg-rose-50',
        texto: 'text-[#4a1d2e]',
        suave: 'text-[#8a5a6b]',
        regua: 'bg-pink-600',
        peso: 'font-extrabold',
        cardDestaque: 'bg-white border-pink-200',
        textoDestaque: 'text-[#4a1d2e]',
        suaveDestaque: 'text-[#8a5a6b]',
        precoDestaque: 'text-pink-700',
        selo: 'bg-pink-600 text-white',
        card: 'bg-white border-pink-200',
        textoCard: 'text-[#4a1d2e]',
        suaveCard: 'text-[#8a5a6b]',
        precoCard: 'text-pink-700',
        linha: 'border-pink-200',
        foto: 'bg-pink-100 text-pink-400',
        sync: 'bg-pink-100 text-[#4a1d2e]',
    },
    oceano: {
        fonte: SANS,
        fundo: 'bg-[#0b2545]',
        texto: 'text-sky-50',
        suave: 'text-[#9fb8d4]',
        regua: 'bg-teal-400',
        peso: 'font-semibold',
        cardDestaque: 'bg-[#13315c] border-teal-400/40',
        textoDestaque: 'text-sky-50',
        suaveDestaque: 'text-[#9fb8d4]',
        precoDestaque: 'text-teal-300',
        selo: 'bg-teal-400 text-[#0b2545]',
        card: 'bg-[#102c50] border-[#1d4370]',
        textoCard: 'text-sky-50',
        suaveCard: 'text-[#9fb8d4]',
        precoCard: 'text-teal-300',
        linha: 'border-[#1d4370]',
        foto: 'bg-[#1d4370] text-[#9fb8d4]',
        sync: 'bg-[#1d4370] text-sky-50',
    },
    premium: {
        fonte: "font-['Playfair_Display',Georgia,serif]",
        fundo: 'bg-neutral-950',
        texto: 'text-[#f5f5f0]',
        suave: 'text-neutral-400',
        regua: 'bg-[#d4af37]',
        peso: 'font-bold',
        cardDestaque: 'bg-[#141414] border-[#d4af37]/50',
        textoDestaque: 'text-[#f5f5f0]',
        suaveDestaque: 'text-neutral-400',
        precoDestaque: 'text-[#e5c35a]',
        selo: 'bg-[#d4af37] text-neutral-950',
        card: 'bg-[#111111] border-neutral-800',
        textoCard: 'text-[#f5f5f0]',
        suaveCard: 'text-neutral-400',
        precoCard: 'text-[#e5c35a]',
        linha: 'border-neutral-800',
        foto: 'bg-neutral-800 text-neutral-500',
        sync: 'bg-neutral-800 text-[#f5f5f0]',
    },
};

export type ProdutoNaTv = {
    id: number;
    nome: string;
    descricao: string | null;
    preco: string;
    foto_url: string | null;
};

type PaginaBase = {
    duracao_segundos: number;
};

export type TvPagina = PaginaBase &
    (
        | { layout: 'destaques_grade'; destaques: ProdutoNaTv[]; itens: ProdutoNaTv[] }
        | { layout: 'categoria'; titulo: string | null; itens: ProdutoNaTv[] }
        | { layout: 'banner'; imagem_url: string }
        | { layout: 'imagem_lista'; imagem_url: string; titulo: string | null; itens: ProdutoNaTv[] }
        | { layout: 'aviso'; titulo: string | null; texto: string | null; qr: { link: string; legenda: string | null } | null }
        | { layout: 'produto_destaque'; produto: ProdutoNaTv; selo: string | null; chamada: string | null; foto_posicao: 'esquerda' | 'direita' }
    );

export type TvBoard = {
    nome: string;
    tema: TemaMenuBoard;
    paginas: TvPagina[];
};

export function formatarPrecoTv(valor: string): string {
    return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
