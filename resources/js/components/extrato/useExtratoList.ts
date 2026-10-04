import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { visitExtrato } from '@/components/extrato/extratoQuery';
import type {
    ExtratoFilters,
    ExtratoPageProps,
    ExtratoPaginationMeta,
    ExtratoParcela,
    ExtratoQueryOverride,
    ExtratoResumo,
    ExtratoStatusTab,
} from '@/components/extrato/types';
import { parcelasDaPagina } from '@/components/extrato/types';

const EMPTY_COUNTS: Record<ExtratoStatusTab, number> = {
    todos: 0,
    aberto: 0,
    pago: 0,
    parcial: 0,
};

export function useExtratoList(): {
    filters: ExtratoFilters;
    resumo: ExtratoResumo | undefined;
    items: ExtratoParcela[] | null;
    meta: ExtratoPaginationMeta | null;
    loaded: boolean;
    busca: string;
    setBusca: (value: string) => void;
    statusTab: ExtratoStatusTab;
    counts: Record<ExtratoStatusTab, number>;
    perPage: number;
    categoriasPadrao: ExtratoPageProps['categorias_padrao'];
    visit: (override?: ExtratoQueryOverride) => void;
} {
    const { props } = usePage<ExtratoPageProps>();
    const filters = props.filters ?? {};
    const resumo = props.resumo;
    const { items, meta } = parcelasDaPagina(props.parcelas);
    const [busca, setBusca] = useState(String(filters.busca ?? ''));

    useEffect(() => {
        setBusca(String(filters.busca ?? ''));
    }, [filters.busca]);

    useEffect(() => {
        const trimmed = busca.trim();
        const current = String(filters.busca ?? '').trim();
        if (trimmed === current) {
            return;
        }

        const timer = window.setTimeout(() => {
            visitExtrato(filters, { busca: trimmed || null, page: 1 });
        }, 400);

        return () => window.clearTimeout(timer);
    }, [busca]);

    const statusFromFilter = filters.status;
    const statusTab: ExtratoStatusTab =
        statusFromFilter === 'aberto' || statusFromFilter === 'pago' || statusFromFilter === 'parcial'
            ? statusFromFilter
            : 'todos';

    const counts = resumo?.counts ?? EMPTY_COUNTS;
    const perPage = Number(meta?.per_page ?? filters.per_page ?? 20);

    return {
        filters,
        resumo,
        items,
        meta,
        loaded: props.parcelas != null,
        busca,
        setBusca,
        statusTab,
        counts,
        perPage,
        categoriasPadrao: props.categorias_padrao ?? null,
        visit: (override: ExtratoQueryOverride = {}) => visitExtrato(filters, override),
    };
}
