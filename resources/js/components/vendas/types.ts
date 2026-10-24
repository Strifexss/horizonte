export type VendaStatus = 'aberta' | 'fechada' | 'cancelada';

export type VendaStatusTab = 'todos' | VendaStatus;

export type VendaResumo = {
    counts?: Record<VendaStatusTab, number>;
};

export type VendaNamed = {
    id: number;
    nome: string;
};

export type VendaItem = {
    id: number;
    produto_id: number;
    produto: VendaNamed | null;
    quantidade: string;
    valor_unitario: string;
    valor_total: string;
};

export type VendaPagamento = {
    id: number;
    forma_pagamento_id: number;
    forma_pagamento: VendaNamed | null;
    valor: string;
};

export type Venda = {
    id: number;
    status: VendaStatus;
    total: string;
    total_pago: string;
    data_venda: string | null;
    observacao: string | null;
    itens: VendaItem[];
    pagamentos: VendaPagamento[];
};

export type VendaFilters = {
    data_inicio?: string;
    data_fim?: string;
    forma_pagamento_id?: number | null;
    status?: VendaStatusTab;
    per_page?: number;
    page?: number;
};

export type VendaPaginationMeta = {
    from?: number | null;
    to?: number | null;
    total?: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
};

export type VendaQueryOverride = Partial<Record<keyof VendaFilters, string | number | null>>;

/** Linha editável do modal: quantidade fica em texto para aceitar decimal digitado com vírgula. */
export type VendaItemRascunho = {
    chave: string;
    produto: VendaNamed;
    quantidade: string;
    valor_unitario: number | null;
};

/** `acompanhaTotal`: pagamento único criado pelo cartão, que segue o total enquanto não for editado à mão. */
export type VendaPagamentoRascunho = {
    chave: string;
    forma_pagamento_id: number;
    valor: number | null;
    acompanhaTotal: boolean;
};

export type ProdutoParaVenda = VendaNamed & {
    preco_venda: string | number;
};

export const VENDA_STATUS_META: Record<VendaStatus, { label: string; className: string }> = {
    aberta: {
        label: 'Aberta',
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    },
    fechada: {
        label: 'Fechada',
        className: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300',
    },
    cancelada: {
        label: 'Cancelada',
        className: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    },
};

function isCollection(value: unknown): value is { data: Venda[]; meta?: VendaPaginationMeta } {
    return typeof value === 'object' && value !== null && Array.isArray((value as { data?: unknown }).data);
}

export function vendasDaPagina(vendas: unknown): { items: Venda[] | null; meta: VendaPaginationMeta | null } {
    if (vendas == null) {
        return { items: null, meta: null };
    }

    if (Array.isArray(vendas)) {
        return { items: vendas as Venda[], meta: null };
    }

    if (isCollection(vendas)) {
        return { items: vendas.data, meta: vendas.meta ?? null };
    }

    return { items: null, meta: null };
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatQuantidade(value: number): string {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(value);
}

export function formatDataVenda(iso: string | null): string {
    if (!iso) {
        return '';
    }

    return new Date(iso).toLocaleDateString('pt-BR');
}

export function parseQuantidade(value: string): number {
    const parsed = Number(String(value).replace(',', '.'));

    return Number.isFinite(parsed) ? parsed : 0;
}

export function emCentavos(value: number): number {
    return Math.round(value * 100);
}

export function novaChave(): string {
    return Math.random().toString(36).slice(2);
}
