export type ExtratoStatusTab = 'todos' | 'aberto' | 'pago' | 'parcial';

export type ExtratoParcelaStatus = Exclude<ExtratoStatusTab, 'todos'>;

export type ExtratoNamed = {
    id?: number | string;
    nome?: string | null;
};

export type ExtratoParcela = {
    id?: number | string | null;
    descricao?: string | null;
    data_competencia?: string | null;
    data_vencimento?: string | null;
    valor?: number | string | null;
    valor_pago?: number | string | null;
    quantidade?: number | string | null;
    qtd_parcelas?: number | string | null;
    tipo?: string | null;
    produto_id?: number | string | null;
    fornecedor_id?: number | string | null;
    funcionario_id?: number | string | null;
    categoria_id?: number | string | null;
    conta_id?: number | string | null;
    categoria?: (ExtratoNamed & { padrao?: number | null }) | null;
    produto?:
        | (ExtratoNamed & {
              preco_compra?: number | string;
              grupo?: ExtratoNamed | null;
              fornecedor?: ExtratoNamed | null;
              fornecedor_id?: number | string | null;
          })
        | null;
    fornecedor?: ExtratoNamed | null;
    funcionario?: (ExtratoNamed & { salario?: number | string }) | null;
    conta?: ExtratoNamed | null;
    financeiro?: { tipo?: string | null } | null;
};

export type ExtratoFilters = {
    tipo_data?: string;
    data_inicio?: string;
    data_fim?: string;
    conta_id?: number;
    categoria_id?: number;
    status?: string;
    busca?: string;
    per_page?: number;
    sort?: string;
    sort_dir?: string;
};

export type ExtratoResumo = {
    counts?: Record<ExtratoStatusTab, number>;
    total_credits?: number;
    total_debits?: number;
};

export type ExtratoPaginationMeta = {
    from?: number | null;
    to?: number | null;
    total?: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
};

export type ExtratoParcelasCollection = {
    data: ExtratoParcela[];
    meta?: ExtratoPaginationMeta;
};

export type ExtratoParcelasPayload = ExtratoParcela[] | ExtratoParcelasCollection;

export type ExtratoCategoriasPadrao = {
    receita?: { id: number | string; nome: string; padrao?: number | null } | null;
    despesa?: { id: number | string; nome: string; padrao?: number | null } | null;
};

export type ExtratoPageProps = {
    filters?: ExtratoFilters;
    resumo?: ExtratoResumo;
    parcelas?: ExtratoParcelasPayload | null;
    categorias_padrao?: ExtratoCategoriasPadrao | null;
};

export type ExtratoQueryOverride = Record<string, string | number | null | undefined>;

function isParcelasCollection(value: unknown): value is ExtratoParcelasCollection {
    return typeof value === 'object' && value !== null && Array.isArray((value as { data?: unknown }).data);
}

export function parcelasDaPagina(parcelas: unknown): {
    items: ExtratoParcela[] | null;
    meta: ExtratoPaginationMeta | null;
} {
    if (parcelas == null) {
        return { items: null, meta: null };
    }

    if (Array.isArray(parcelas)) {
        return { items: parcelas as ExtratoParcela[], meta: null };
    }

    if (isParcelasCollection(parcelas)) {
        return { items: parcelas.data, meta: parcelas.meta ?? null };
    }

    return { items: null, meta: null };
}
