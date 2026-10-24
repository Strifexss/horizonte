import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import { FiltroPeriodoDatas } from '@/components/padrões';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const TODAS_FORMAS = 'todas';

export type VendaFilterValues = {
    dataInicio: string;
    dataFim: string;
    formaPagamentoId: string;
    status: string;
};

type Props = {
    values: VendaFilterValues;
    onChange: (patch: Partial<VendaFilterValues>) => void;
    formasPagamento: FormaPagamentoItem[];
    idPrefix?: string;
};

export default function VendasFilterFields({ values, onChange, formasPagamento, idPrefix = '' }: Props) {
    return (
        <div className="grid min-w-0 items-end gap-3 md:grid-cols-4">
            <div className="min-w-0 md:col-span-2">
                <FiltroPeriodoDatas
                    dataInicio={values.dataInicio}
                    dataFim={values.dataFim}
                    onInicioChange={(dataInicio) => onChange({ dataInicio })}
                    onFimChange={(dataFim) => onChange({ dataFim })}
                    idPrefix={idPrefix}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor={`${idPrefix}forma`}>Forma de pagamento</Label>
                <Select value={values.formaPagamentoId} onValueChange={(formaPagamentoId) => onChange({ formaPagamentoId })}>
                    <SelectTrigger id={`${idPrefix}forma`} className="w-full">
                        <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={TODAS_FORMAS}>Todas</SelectItem>
                        {formasPagamento.map((forma) => (
                            <SelectItem key={forma.id} value={String(forma.id)}>
                                {forma.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor={`${idPrefix}status`}>Status</Label>
                <Select value={values.status} onValueChange={(status) => onChange({ status })}>
                    <SelectTrigger id={`${idPrefix}status`} className="w-full">
                        <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="aberta">Aberta</SelectItem>
                        <SelectItem value="fechada">Fechada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
