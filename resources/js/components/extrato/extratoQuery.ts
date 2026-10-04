import type { ExtratoFilters, ExtratoQueryOverride } from '@/components/extrato/types';
import { router } from '@inertiajs/react';

export function buildExtratoQuery(filters: ExtratoFilters, override: ExtratoQueryOverride = {}): Record<string, string | number> {
    const payload: Record<string, string | number> = {
        tipo_data: String(override.tipo_data ?? filters.tipo_data ?? 'vencimento'),
        data_inicio: String(override.data_inicio ?? filters.data_inicio ?? ''),
        data_fim: String(override.data_fim ?? filters.data_fim ?? ''),
        status: String(override.status ?? filters.status ?? 'todos'),
        per_page: Number(override.per_page ?? filters.per_page ?? 20),
        page: Number(override.page ?? 1),
    };

    const contaId = override.conta_id !== undefined ? override.conta_id : filters.conta_id;
    const categoriaId = override.categoria_id !== undefined ? override.categoria_id : filters.categoria_id;
    const buscaValue = override.busca !== undefined ? override.busca : filters.busca;
    const sortValue = override.sort !== undefined ? override.sort : (filters.sort ?? 'data');
    const sortDirValue = override.sort_dir !== undefined ? override.sort_dir : (filters.sort_dir ?? 'desc');

    if (contaId) {
        payload.conta_id = Number(contaId);
    }
    if (categoriaId) {
        payload.categoria_id = Number(categoriaId);
    }
    if (buscaValue) {
        payload.busca = String(buscaValue);
    }
    if (sortValue) {
        payload.sort = String(sortValue);
    }
    if (sortDirValue) {
        payload.sort_dir = String(sortDirValue);
    }

    return payload;
}

export function visitExtrato(filters: ExtratoFilters, override: ExtratoQueryOverride = {}): void {
    router.get(route('extrato.index'), buildExtratoQuery(filters, override), {
        preserveScroll: true,
        preserveState: true,
        replace: true,
    });
}
