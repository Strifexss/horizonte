import type { ProdutoFilters, ProdutoQueryOverride } from '@/components/produtos/types';
import { router } from '@inertiajs/react';

export function buildProdutosQuery(filters: ProdutoFilters, override: ProdutoQueryOverride = {}): Record<string, string | number> {
    const payload: Record<string, string | number> = {
        per_page: Number(override.per_page ?? filters.per_page ?? 20),
        page: Number(override.page ?? 1),
        sort: String(override.sort ?? filters.sort ?? 'nome'),
        sort_dir: String(override.sort_dir ?? filters.sort_dir ?? 'asc'),
    };

    const buscaValue = override.busca !== undefined ? override.busca : filters.busca;
    if (buscaValue) {
        payload.busca = String(buscaValue);
    }

    return payload;
}

export function visitProdutos(filters: ProdutoFilters, override: ProdutoQueryOverride = {}): void {
    router.get(route('produtos'), buildProdutosQuery(filters, override), {
        preserveScroll: true,
        preserveState: true,
        replace: true,
    });
}
