import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import { MobileFilterDock } from '@/components/padrões';
import { Button } from '@/components/ui/button';
import type { VendaFilters } from '@/components/vendas/types';
import VendasFilterFields, { TODAS_FORMAS, type VendaFilterValues } from '@/components/vendas/VendasFilterFields';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function isoDate(date: Date): string {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function valoresDoMesAtual(): VendaFilterValues {
    const hoje = new Date();

    return {
        dataInicio: isoDate(new Date(hoje.getFullYear(), hoje.getMonth(), 1)),
        dataFim: isoDate(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)),
        formaPagamentoId: TODAS_FORMAS,
        status: 'todos',
    };
}

function paraFiltros(filters: VendaFilters, values: VendaFilterValues): VendaFilters {
    return {
        ...filters,
        data_inicio: values.dataInicio,
        data_fim: values.dataFim,
        forma_pagamento_id: values.formaPagamentoId === TODAS_FORMAS ? null : Number(values.formaPagamentoId),
        status: values.status as VendaFilters['status'],
    };
}

function contarFiltrosAplicados(values: VendaFilterValues): number {
    return (values.formaPagamentoId !== TODAS_FORMAS ? 1 : 0) + (values.status !== 'todos' ? 1 : 0);
}

type Props = {
    filters: VendaFilters;
    formasPagamento: FormaPagamentoItem[];
    onApply: (filters: VendaFilters) => void;
};

export default function VendasFilters({ filters, formasPagamento, onApply }: Props) {
    const initialValues = useMemo<VendaFilterValues>(
        () => ({
            dataInicio: filters.data_inicio ?? '',
            dataFim: filters.data_fim ?? '',
            formaPagamentoId: filters.forma_pagamento_id ? String(filters.forma_pagamento_id) : TODAS_FORMAS,
            status: filters.status ?? 'todos',
        }),
        [filters.data_inicio, filters.data_fim, filters.forma_pagamento_id, filters.status],
    );
    const [values, setValues] = useState<VendaFilterValues>(initialValues);

    useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    const onChange = (patch: Partial<VendaFilterValues>) => setValues((atual) => ({ ...atual, ...patch }));
    const apply = (next: VendaFilterValues = values) => onApply(paraFiltros(filters, next));

    return (
        <>
            <MobileFilterDock
                dataInicio={values.dataInicio}
                dataFim={values.dataFim}
                onPeriodApply={(dataInicio, dataFim) => {
                    const next = { ...values, dataInicio, dataFim };
                    setValues(next);
                    apply(next);
                }}
                activeCount={contarFiltrosAplicados(values)}
                onApply={() => apply()}
                onClearAll={() => {
                    const next = valoresDoMesAtual();
                    setValues(next);
                    apply(next);
                }}
                sheetDescription="Refine as vendas listadas."
            >
                <VendasFilterFields idPrefix="mobile-vendas-" values={values} onChange={onChange} formasPagamento={formasPagamento} />
            </MobileFilterDock>

            <div className="border-sidebar-border/70 hidden rounded-lg border bg-white p-4 shadow-sm md:block dark:bg-slate-900">
                <VendasFilterFields idPrefix="vendas-" values={values} onChange={onChange} formasPagamento={formasPagamento} />
                <div className="mt-3 flex justify-end">
                    <Button type="button" variant="primary" className="inline-flex items-center gap-2" onClick={() => apply()}>
                        <Search />
                        Pesquisar
                    </Button>
                </div>
            </div>
        </>
    );
}
