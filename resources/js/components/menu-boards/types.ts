export type TemaMenuBoard = 'dark' | 'clean' | 'vibrante' | 'rustico' | 'natural' | 'doce' | 'oceano' | 'premium';

export type LayoutPagina = 'destaques_grade' | 'categoria' | 'banner' | 'imagem_lista' | 'aviso' | 'produto_destaque';

export type FonteProdutos = 'manual' | 'categoria';

export type OrdenacaoProdutos = 'nome' | 'menor_preco' | 'maior_preco';

export type PaginaResumo = {
    nome: string;
    layout: LayoutPagina;
    duracao_segundos: number;
};

export type MenuBoardResumo = {
    id: number;
    nome: string;
    tema: TemaMenuBoard;
    ativo: boolean;
    paginas_count: number;
    ciclo_segundos: number;
    atualizado_em: string | null;
    paginas: PaginaResumo[];
};

export type MenuBoardItemForm = {
    produto_id: number;
    destaque: boolean;
};

/**
 * Campos de configuração de todos os layouts; cada layout usa só os seus e o servidor descarta o resto.
 */
export type ConfiguracaoPagina = {
    fonte?: FonteProdutos;
    grupo_id?: number | null;
    ordenacao?: OrdenacaoProdutos;
    ocultar_destaques?: boolean;
    titulo?: string | null;
    texto?: string | null;
    qr_ativo?: boolean;
    qr_link?: string | null;
    qr_legenda?: string | null;
    selo?: string | null;
    chamada?: string | null;
    mostrar_descricao?: boolean;
    foto_posicao?: 'esquerda' | 'direita';
};

export type PaginaEdicao = PaginaResumo & {
    configuracao: ConfiguracaoPagina;
    imagem_atual: string | null;
    imagem_url: string | null;
    itens: MenuBoardItemForm[];
};

export type MenuBoardEdicao = {
    id: number;
    nome: string;
    tema: TemaMenuBoard;
    ativo: boolean;
    paginas: PaginaEdicao[];
};

export type PaginaForm = PaginaEdicao & {
    /** Identifica a página na tela enquanto o board não é salvo. */
    chave: string;
    imagem: File | null;
};

export type MenuBoardFormValues = {
    nome: string;
    tema: TemaMenuBoard;
    paginas: PaginaForm[];
};

export type ProdutoDoBoard = {
    id: number;
    nome: string;
    descricao: string | null;
    preco_venda: string;
    foto_url: string | null;
    grupo_id: number | null;
    grupo?: { id: number | string; nome: string } | null;
};

export type GrupoDoBoard = {
    id: number;
    nome: string;
};

export type TvDispositivoItem = {
    id: number;
    nome: string;
    conectada_em: string | null;
    ultimo_acesso_em: string | null;
};

export type PareamentoTv = {
    url: string;
    pin: string | null;
    pin_expira_em: string | null;
    dispositivos: TvDispositivoItem[];
};

export function formatarPreco(valor: string | number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor ?? 0));
}

export function formatarData(iso: string | null): string {
    if (!iso) {
        return '';
    }

    const [ano, mes, dia] = iso.slice(0, 10).split('-');

    return `${dia}/${mes}/${ano}`;
}

export function formatarHora(iso: string | null): string {
    if (!iso) {
        return '';
    }

    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatarCiclo(segundos: number): string {
    if (segundos < 60) {
        return `${segundos} s`;
    }

    const minutos = Math.floor(segundos / 60);
    const resto = segundos % 60;

    return resto ? `${minutos} min ${resto} s` : `${minutos} min`;
}
