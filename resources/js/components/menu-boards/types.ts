export type TemaMenuBoard = 'dark' | 'clean' | 'vibrante';

export type MenuBoardResumo = {
    id: number;
    nome: string;
    tema: TemaMenuBoard;
    ativo: boolean;
    itens_count: number;
    destaques_count: number;
    atualizado_em: string | null;
};

export type MenuBoardItemForm = {
    produto_id: number;
    destaque: boolean;
};

export type MenuBoardEdicao = {
    id: number;
    nome: string;
    tema: TemaMenuBoard;
    ativo: boolean;
    itens: MenuBoardItemForm[];
};

export type MenuBoardFormValues = {
    nome: string;
    tema: TemaMenuBoard;
    itens: MenuBoardItemForm[];
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
