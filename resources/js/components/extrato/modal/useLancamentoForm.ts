import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { hojeISO, idNumericoOuNull, NOME_FORMA_PADRAO, tipoDaParcela, toInputValue, toMoneyFormValue } from './lancamentoValores';
import type { ExtratoModalMode, ExtratoModalParcela, LancamentoFormData } from './types';

type Params = {
    mode: ExtratoModalMode;
    parcela: ExtratoModalParcela | null;
    formasPagamento: FormaPagamentoItem[];
    onOpenChange: (aberto: boolean) => void;
};

/** Form Inertia do lançamento: valores iniciais, derivados da forma de pagamento e envio (criar ou atualizar). */
export function useLancamentoForm({ mode, parcela, formasPagamento, onOpenChange }: Params) {
    const form = useForm<LancamentoFormData>({
        descricao: toInputValue(parcela?.descricao),
        data_competencia: toInputValue(parcela?.data_competencia) || hojeISO(),
        valor: toInputValue(parcela?.valor),
        valor_pago: toInputValue(parcela?.valor_pago),
        tipo: tipoDaParcela(parcela),
        id: parcela?.id ?? null,
        categoria_id: idNumericoOuNull(parcela?.categoria_id),
        produto_id: idNumericoOuNull(parcela?.produto_id),
        fornecedor_id: idNumericoOuNull(parcela?.fornecedor_id),
        funcionario_id: idNumericoOuNull(parcela?.funcionario_id),
        conta_id: idNumericoOuNull(parcela?.conta_id),
        quantidade: toInputValue(parcela?.quantidade ?? 1),
        forma_pagamento_id: idNumericoOuNull(parcela?.forma_pagamento?.id),
    });
    const { data, post, put, transform, reset } = form;

    const ehLancamentoDeVenda = mode === 'edit' && parcela?.venda_id != null;
    const formaSelecionada = formasPagamento.find((forma) => forma.id === Number(data.forma_pagamento_id)) ?? null;
    const formasDisponiveis = formasPagamento.filter((forma) => forma.ativo || forma.id === Number(data.forma_pagamento_id));
    const idFormaPadrao = formasPagamento.find((forma) => forma.padrao && forma.nome === NOME_FORMA_PADRAO)?.id ?? null;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const isEdit = mode === 'edit' && parcela?.id;
        const url = isEdit ? route('parcela.update', { id: parcela.id }) : route('extrato.store');
        const submitMethod = isEdit ? put : post;

        transform((current) => ({
            ...current,
            valor: toMoneyFormValue(current.valor),
            valor_pago: toMoneyFormValue(current.valor_pago),
            quantidade: Math.max(1, Number(current.quantidade) || 1),
            ...(isEdit
                ? {}
                : {
                      data_vencimento: current.data_competencia,
                      qtd_parcelas: 1,
                  }),
        }));

        submitMethod(url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    return { ...form, ehLancamentoDeVenda, formaSelecionada, formasDisponiveis, idFormaPadrao, submit };
}

export type LancamentoForm = ReturnType<typeof useLancamentoForm>;
