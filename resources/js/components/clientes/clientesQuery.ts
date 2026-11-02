import type { ClienteFilters, ClienteQueryOverride } from '@/components/clientes/types';
import { router } from '@inertiajs/react';

export function buildClientesQuery(filters: ClienteFilters, override: ClienteQueryOverride = {}): Record<string, string | number> {
    const payload: Record<string, string | number> = {
        per_page: Number(override.per_page ?? filters.per_page ?? 20),
        page: Number(override.page ?? 1),
        sort: String(override.sort ?? filters.sort ?? 'nome'),
        sort_dir: String(override.sort_dir ?? filters.sort_dir ?? 'asc'),
    };

    const busca = override.busca !== undefined ? override.busca : filters.busca;
    if (busca) {
        payload.busca = String(busca);
    }

    return payload;
}

export function visitClientes(filters: ClienteFilters, override: ClienteQueryOverride = {}): void {
    router.get(route('clientes'), buildClientesQuery(filters, override), {
        preserveScroll: true,
        preserveState: true,
        replace: true,
    });
}
