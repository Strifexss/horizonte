import type { VendaFilters, VendaQueryOverride } from '@/components/vendas/types';
import { router } from '@inertiajs/react';

export function buildVendasQuery(filters: VendaFilters, override: VendaQueryOverride = {}): Record<string, string | number> {
    const payload: Record<string, string | number> = {
        data_inicio: String(override.data_inicio ?? filters.data_inicio ?? ''),
        data_fim: String(override.data_fim ?? filters.data_fim ?? ''),
        status: String(override.status ?? filters.status ?? 'todos'),
        per_page: Number(override.per_page ?? filters.per_page ?? 20),
        page: Number(override.page ?? 1),
    };

    const formaPagamentoId = override.forma_pagamento_id !== undefined ? override.forma_pagamento_id : filters.forma_pagamento_id;
    if (formaPagamentoId) {
        payload.forma_pagamento_id = Number(formaPagamentoId);
    }

    const busca = override.busca !== undefined ? override.busca : filters.busca;
    if (busca) {
        payload.busca = String(busca);
    }

    return payload;
}

export function visitVendas(filters: VendaFilters, override: VendaQueryOverride = {}): void {
    router.get(route('vendas'), buildVendasQuery(filters, override), {
        preserveScroll: true,
        preserveState: true,
        replace: true,
    });
}
