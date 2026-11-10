import type { ClienteFilters, ClienteQueryOverride } from '@/components/clientes/types';
import { visitLista } from '@/components/padrões/listaNavegacao';

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
    visitLista(route('clientes'), buildClientesQuery(filters, override), ['clientes']);
}
