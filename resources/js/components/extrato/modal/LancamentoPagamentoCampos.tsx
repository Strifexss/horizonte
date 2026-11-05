import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import InputError from '@/components/input-error';
import { FormDialogField } from '@/components/ui/form-dialog-correcao';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LancamentoForm } from './useLancamentoForm';

type Props = {
    form: LancamentoForm;
    formasPagamento: FormaPagamentoItem[];
};

/** Forma de pagamento e data (competência) do lançamento. */
export default function LancamentoPagamentoCampos({ form, formasPagamento }: Props) {
    const { data, setData, errors, processing, ehLancamentoDeVenda, formasDisponiveis } = form;

    return (
        <div className="grid gap-2 md:grid-cols-2">
            <FormDialogField name="forma_pagamento_id">
                <Label htmlFor="forma_pagamento_id">
                    Forma de pagamento <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={data.forma_pagamento_id ? String(data.forma_pagamento_id) : ''}
                    onValueChange={(value) => {
                        const forma = formasPagamento.find((item) => item.id === Number(value));
                        setData({
                            ...data,
                            forma_pagamento_id: Number(value),
                            valor_pago: forma?.baixa_automatica && data.valor ? data.valor : data.valor_pago,
                        });
                    }}
                    disabled={processing || ehLancamentoDeVenda}
                >
                    <SelectTrigger id="forma_pagamento_id" className="w-full">
                        <SelectValue placeholder="Selecione a forma" />
                    </SelectTrigger>
                    <SelectContent>
                        {formasDisponiveis.map((forma) => (
                            <SelectItem key={forma.id} value={String(forma.id)}>
                                {forma.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.forma_pagamento_id} />
            </FormDialogField>
            <FormDialogField name={['data_competencia', 'data_vencimento']}>
                <Label htmlFor="data_competencia">
                    Data <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="data_competencia"
                    type="date"
                    value={data.data_competencia}
                    onChange={(e) => setData('data_competencia', e.target.value)}
                    disabled={processing || ehLancamentoDeVenda}
                />
                <InputError message={errors.data_competencia || (errors as { data_vencimento?: string }).data_vencimento} />
            </FormDialogField>
        </div>
    );
}
