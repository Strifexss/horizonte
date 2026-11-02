import type { ExtratoParcela } from '@/components/extrato/types';
import type { InertiaFormProps } from '@inertiajs/react';

export type ExtratoModalMode = 'create' | 'edit';

/** Lançamento aberto para edição: mesma forma que a listagem do Extrato entrega. */
export type ExtratoModalParcela = ExtratoParcela;

export type TipoLancamento = 'RECEITA' | 'DESPESA';

export type ExtratoOpcaoFornecedor = { id: number | string; nome?: string | null };

/** Item devolvido pelos autocompletes (e pelas opções "+ Cadastrar" do `AsyncSelect`). */
export type ExtratoOpcao = {
    id: number | string;
    nome: string;
    preco_compra?: number | string;
    salario?: number | string;
    padrao?: number | null;
    fornecedor?: ExtratoOpcaoFornecedor | null;
    fornecedor_id?: number | string | null;
    fornecedorId?: number | string | null;
    __create?: boolean;
    __createName?: string;
};

export type LancamentoFormData = {
    descricao: string;
    data_competencia: string;
    valor: string;
    valor_pago: string;
    tipo: TipoLancamento;
    id: number | string | null;
    categoria_id: number | null;
    produto_id: number | null;
    fornecedor_id: number | null;
    funcionario_id: number | null;
    conta_id: number | null;
    quantidade: string;
    forma_pagamento_id: number | null;
};

export type DefinirDadosLancamento = InertiaFormProps<LancamentoFormData>['setData'];

export type RegistroCriado = { id: number; nome: string };

/** Entradas de `flash` que o backend preenche depois de cadastrar um item pelo Extrato. */
export type ExtratoFlash = {
    produto_criado?: RegistroCriado & { preco_compra: number | string };
    funcionario_criado?: RegistroCriado & { salario: number | string };
    fornecedor_criado?: RegistroCriado;
    categoria_criada?: RegistroCriado & { padrao?: number | null };
};
