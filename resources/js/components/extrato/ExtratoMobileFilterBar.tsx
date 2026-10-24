import ExtratoFilterFields, { type ExtratoFilterValues, type FilterOption } from '@/components/extrato/ExtratoFilterFields';
import { MobileFilterDock } from '@/components/padrões';

/**
 * Filtros escolhidos pelo usuário. Tipo de data (sempre competência) e período
 * (já mostrado no chip do mês) não contam.
 */
function contarFiltrosAplicados(values: ExtratoFilterValues): number {
    const escolhidos = [values.conta, values.categoria, values.produto, values.grupo, values.fornecedor, values.formaPagamento];
    const statusEscolhido = values.status !== '' && values.status !== 'todos';

    return escolhidos.filter((filtro) => filtro !== null).length + (statusEscolhido ? 1 : 0);
}

type Props = {
    values: ExtratoFilterValues;
    onDraftChange: (patch: Partial<ExtratoFilterValues>) => void;
    onApply: (values?: ExtratoFilterValues) => void;
    onClearAll: () => void;
    loadContas: (q: string) => Promise<FilterOption[]>;
    loadCategorias: (q: string) => Promise<FilterOption[]>;
    loadProdutos: (q: string) => Promise<FilterOption[]>;
    loadGrupos: (q: string) => Promise<FilterOption[]>;
    loadFornecedores: (q: string) => Promise<FilterOption[]>;
    loadFormasPagamento: (q: string) => Promise<FilterOption[]>;
};

export default function ExtratoMobileFilterBar({
    values,
    onDraftChange,
    onApply,
    onClearAll,
    loadContas,
    loadCategorias,
    loadProdutos,
    loadGrupos,
    loadFornecedores,
    loadFormasPagamento,
}: Props) {
    return (
        <MobileFilterDock
            dataInicio={values.dataInicio}
            dataFim={values.dataFim}
            onPeriodApply={(dataInicio, dataFim) => {
                onDraftChange({ dataInicio, dataFim });
                onApply({ ...values, dataInicio, dataFim });
            }}
            activeCount={contarFiltrosAplicados(values)}
            onApply={() => onApply()}
            onClearAll={onClearAll}
            sheetDescription="Refine os lançamentos do extrato."
        >
            <ExtratoFilterFields
                idPrefix="mobile-"
                values={values}
                onChange={onDraftChange}
                loadContas={loadContas}
                loadCategorias={loadCategorias}
                loadProdutos={loadProdutos}
                loadGrupos={loadGrupos}
                loadFornecedores={loadFornecedores}
                loadFormasPagamento={loadFormasPagamento}
            />
        </MobileFilterDock>
    );
}
