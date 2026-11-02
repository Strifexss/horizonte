export type ClienteItem = {
    id: number;
    nome: string;
    telefone: string | null;
    documento: string | null;
    email: string | null;
    observacao: string | null;
    ativo: boolean;
    padrao: boolean;
};

export type ClienteFilters = {
    busca?: string | null;
    per_page?: number;
    page?: number;
    sort?: string;
    sort_dir?: string;
};

export type ClientePaginationMeta = {
    from?: number | null;
    to?: number | null;
    total?: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
};

export type ClienteQueryOverride = Partial<{
    busca: string | null;
    per_page: number;
    page: number;
    sort: string;
    sort_dir: string;
}>;

export type ClienteCriado = { id: number; nome: string };

export function clientesDaPagina(clientes: unknown): { items: ClienteItem[] | null; meta: ClientePaginationMeta | null } {
    if (clientes == null) {
        return { items: null, meta: null };
    }

    if (typeof clientes === 'object' && Array.isArray((clientes as { data?: unknown }).data)) {
        const colecao = clientes as { data: ClienteItem[]; meta?: ClientePaginationMeta };

        return { items: colecao.data, meta: colecao.meta ?? null };
    }

    return { items: null, meta: null };
}
