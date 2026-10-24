export type FormaPagamentoItem = {
    id: number;
    nome: string;
    ativo: boolean;
    baixa_automatica: boolean;
    padrao: boolean;
};

export function formasPagamentoDaColecao(formas: unknown): FormaPagamentoItem[] | null {
    if (formas == null) {
        return null;
    }

    if (Array.isArray(formas)) {
        return formas as FormaPagamentoItem[];
    }

    const data = (formas as { data?: unknown }).data;

    return Array.isArray(data) ? (data as FormaPagamentoItem[]) : null;
}
