export type ProdutoNamed = {
    id: number | string;
    nome: string;
};

export type ProdutoItem = {
    id: number;
    nome: string;
    codigo: string | null;
    preco_compra: string;
    preco_venda: string;
    ativo: boolean;
    favorito: boolean;
    fornecedor_id: number | null;
    grupo_id: number | null;
    fornecedor: ProdutoNamed | null;
    grupo: ProdutoNamed | null;
    descricao: string | null;
    foto_url: string | null;
};

export type ProdutoFilters = {
    busca?: string | null;
    per_page?: number;
    page?: number;
    sort?: string;
    sort_dir?: string;
};

export type ProdutoPaginationMeta = {
    from?: number | null;
    to?: number | null;
    total?: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
};

export type ProdutoCollection = {
    data: ProdutoItem[];
    meta?: ProdutoPaginationMeta;
};

export type ProdutoQueryOverride = Partial<{
    busca: string | null;
    per_page: number;
    page: number;
    sort: string;
    sort_dir: string;
}>;

function isCollection(value: unknown): value is ProdutoCollection {
    return typeof value === 'object' && value !== null && Array.isArray((value as { data?: unknown }).data);
}

export function produtosDaPagina(produtos: unknown): {
    items: ProdutoItem[] | null;
    meta: ProdutoPaginationMeta | null;
} {
    if (produtos == null) {
        return { items: null, meta: null };
    }

    if (Array.isArray(produtos)) {
        return { items: produtos as ProdutoItem[], meta: null };
    }

    if (isCollection(produtos)) {
        return { items: produtos.data, meta: produtos.meta ?? null };
    }

    return { items: null, meta: null };
}

/** Campos do formulário de produto (modal de criar/editar). */
export type ProdutoFormValues = {
    nome: string;
    codigo: string;
    preco_compra: string;
    preco_venda: string;
    ativo: boolean;
    favorito: boolean;
    fornecedor_id: number | null;
    grupo_id: number | null;
    descricao: string;
    foto: File | null;
    remover_foto: boolean;
};

export const PRODUTO_VAZIO: ProdutoFormValues = {
    nome: '',
    codigo: '',
    preco_compra: '',
    preco_venda: '',
    ativo: true,
    favorito: false,
    fornecedor_id: null,
    grupo_id: null,
    descricao: '',
    foto: null,
    remover_foto: false,
};
