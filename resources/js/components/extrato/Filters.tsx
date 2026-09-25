import { Button } from '@/components/ui/button';
import ExtratoFilterFields, {
    type ExtratoFilterValues,
    type FilterOption,
} from '@/components/extrato/ExtratoFilterFields';
import ExtratoMobileFilterBar from '@/components/extrato/ExtratoMobileFilterBar';
import { router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

type FiltersProps = {
    tipo_data?: string;
    data_inicio?: string;
    data_fim?: string;
    conta_id?: number;
    categoria_id?: number;
    status?: string;
};

function isoDate(date: Date): string {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function inicioMesISO(): string {
    const hoje = new Date();

    return isoDate(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
}

function fimMesISO(): string {
    const hoje = new Date();

    return isoDate(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0));
}

function queryNome(key: string): string {
    if (typeof window === 'undefined') {
        return '';
    }

    return new URLSearchParams(window.location.search).get(key) ?? '';
}

function buildPayload(
    values: ExtratoFilterValues,
    extras: { busca?: string; per_page?: number } = {},
): Record<string, string | number> {
    const payload: Record<string, string | number> = {
        tipo_data: values.tipoData,
        data_inicio: values.dataInicio,
        data_fim: values.dataFim,
        status: values.status,
        per_page: extras.per_page ?? 20,
        page: 1,
    };

    if (values.conta) {
        payload.conta_id = Number(values.conta.id);
        payload.conta_nome = values.conta.nome;
    }

    if (values.categoria) {
        payload.categoria_id = Number(values.categoria.id);
        payload.categoria_nome = values.categoria.nome;
    }

    if (extras.busca) {
        payload.busca = extras.busca;
    }

    return payload;
}

export default function ExtratoFilters() {
    const { props } = usePage();
    const filters = ((props as { filters?: FiltersProps & { busca?: string; per_page?: number } }).filters ??
        {}) as FiltersProps & { busca?: string; per_page?: number };

    const initialValues = useMemo<ExtratoFilterValues>(
        () => ({
            tipoData: filters.tipo_data ?? 'vencimento',
            dataInicio: filters.data_inicio ?? inicioMesISO(),
            dataFim: filters.data_fim ?? fimMesISO(),
            conta: filters.conta_id
                ? { id: filters.conta_id, nome: queryNome('conta_nome') || String(filters.conta_id) }
                : null,
            categoria: filters.categoria_id
                ? {
                      id: filters.categoria_id,
                      nome: queryNome('categoria_nome') || String(filters.categoria_id),
                  }
                : null,
            status: filters.status ?? 'todos',
        }),
        [filters.tipo_data, filters.data_inicio, filters.data_fim, filters.conta_id, filters.categoria_id, filters.status],
    );

    const [values, setValues] = useState<ExtratoFilterValues>(initialValues);

    React.useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    const loadContas = async (q: string): Promise<FilterOption[]> => {
        const res = await fetch(`/contas/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
            return [];
        }

        return res.json();
    };

    const loadCategorias = async (q: string): Promise<FilterOption[]> => {
        const res = await fetch(`/categorias/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
            return [];
        }

        return res.json();
    };

    const extras = () => ({
        busca: filters.busca,
        per_page: filters.per_page ?? 20,
    });

    const apply = (override?: ExtratoFilterValues) => {
        const next = override ?? values;
        router.get(route('extrato.index'), buildPayload(next, extras()), { preserveScroll: true });
    };

    const clearAll = () => {
        const next: ExtratoFilterValues = {
            tipoData: 'vencimento',
            dataInicio: inicioMesISO(),
            dataFim: fimMesISO(),
            conta: null,
            categoria: null,
            status: 'todos',
        };
        setValues(next);
        router.get(route('extrato.index'), buildPayload(next, { per_page: extras().per_page }), {
            preserveScroll: true,
        });
    };

    const clearChip = (key: string) => {
        const next = { ...values };
        if (key === 'conta') {
            next.conta = null;
        }
        if (key === 'categoria') {
            next.categoria = null;
        }
        if (key === 'status') {
            next.status = 'todos';
        }
        if (key === 'tipo_data') {
            next.tipoData = 'vencimento';
        }
        setValues(next);
        router.get(route('extrato.index'), buildPayload(next, extras()), { preserveScroll: true });
    };

    return (
        <>
            <ExtratoMobileFilterBar
                values={values}
                onDraftChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
                onApply={apply}
                onClearAll={clearAll}
                onClearChip={clearChip}
                loadContas={loadContas}
                loadCategorias={loadCategorias}
            />

            <div className="hidden rounded-lg border border-sidebar-border/70 bg-white p-4 shadow-sm md:block dark:bg-slate-900">
                <ExtratoFilterFields
                    values={values}
                    onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
                    loadContas={loadContas}
                    loadCategorias={loadCategorias}
                />
                <div className="mt-3 flex justify-end md:col-span-8">
                    <Button
                        type="button"
                        variant="primary"
                        size="default"
                        className="inline-flex items-center gap-2"
                        onClick={() => apply()}
                    >
                        <Search />
                        Pesquisar
                    </Button>
                </div>
            </div>
        </>
    );
}
