import type { ExtratoCategoriasPadrao } from '@/components/extrato/types';
import { useEffect } from 'react';
import { carregarCategorias, carregarContas } from './buscaOpcoes';
import { hojeISO, idNumericoOuNull, tipoDaParcela, toInputValue, toMoneyFormValue } from './lancamentoValores';
import type { ExtratoModalMode, ExtratoModalParcela, TipoLancamento } from './types';
import type { LancamentoForm } from './useLancamentoForm';
import type { LancamentoSelecoes } from './useLancamentoSelecoes';

type Params = {
    open: boolean;
    mode: ExtratoModalMode;
    parcela: ExtratoModalParcela | null;
    categoriasPadrao?: ExtratoCategoriasPadrao | null;
    activeTab: TipoLancamento;
    setActiveTab: (tipo: TipoLancamento) => void;
    form: LancamentoForm;
    selecoes: LancamentoSelecoes;
};

/**
 * Preenchimento do lançamento ao abrir o modal: carrega os dados da parcela na edição, ou aplica os
 * padrões (conta padrão, categoria PRODUTO na despesa, categoria padrão de receita) na criação.
 */
export function useLancamentoPadroes({ open, mode, parcela, categoriasPadrao, activeTab, setActiveTab, form, selecoes }: Params): void {
    const { setData, reset, clearErrors, idFormaPadrao } = form;

    const aplicarProdutoPadrao = async () => {
        const categorias = await carregarCategorias('', activeTab);
        const categoriaProduto = categorias.find((c) => String(c.nome).toUpperCase() === 'PRODUTO' && Number(c.padrao ?? 0) === 1);
        if (categoriaProduto) {
            selecoes.setCategoriaSelecionada(categoriaProduto);
            setData('categoria_id', Number(categoriaProduto.id));
        }
    };

    const aplicarReceitaPadrao = () => {
        const categoriaReceita = categoriasPadrao?.receita ?? null;
        if (categoriaReceita) {
            selecoes.setCategoriaSelecionada(categoriaReceita);
            setData('categoria_id', Number(categoriaReceita.id));
        }
    };

    const aplicarContaPadrao = async () => {
        const contas = await carregarContas('');
        const contaPadrao = contas.find((c) => Number(c.padrao ?? 0) === 1);
        if (contaPadrao) {
            selecoes.setContaSelecionada(contaPadrao);
            setData('conta_id', Number(contaPadrao.id));
        }
    };

    useEffect(() => {
        setData('tipo', activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (!open) return;

        const isEdit = mode === 'edit' && parcela;
        const abaInicial = tipoDaParcela(parcela);

        const contaId = parcela?.conta_id ?? parcela?.conta?.id ?? null;
        const categoriaId = parcela?.categoria_id ?? parcela?.categoria?.id ?? null;
        const produtoId = parcela?.produto_id ?? parcela?.produto?.id ?? null;
        const funcionarioId = parcela?.funcionario_id ?? parcela?.funcionario?.id ?? null;
        const fornecedorId = parcela?.fornecedor_id ?? parcela?.produto?.fornecedor?.id ?? null;
        const contaNome = parcela?.conta?.nome ?? null;
        const categoriaNome = parcela?.categoria?.nome ?? null;
        const produtoNome = parcela?.produto?.nome ?? null;
        const funcionarioNome = parcela?.funcionario?.nome ?? null;
        const fornecedorNome = parcela?.fornecedor?.nome ?? parcela?.produto?.fornecedor?.nome ?? null;

        setActiveTab(abaInicial);
        selecoes.setContaSelecionada(contaId ? { id: contaId, nome: contaNome ?? String(contaId) } : null);
        selecoes.setCategoriaSelecionada(
            categoriaId
                ? {
                      id: categoriaId,
                      nome: categoriaNome ?? String(categoriaId),
                      padrao: parcela?.categoria?.padrao ?? null,
                  }
                : null,
        );
        selecoes.setProdutoSelecionado(
            produtoId
                ? {
                      id: produtoId,
                      nome: produtoNome ?? String(produtoId),
                      preco_compra: parcela?.produto?.preco_compra,
                  }
                : null,
        );
        selecoes.setFornecedorSelecionado(fornecedorId ? { id: fornecedorId, nome: fornecedorNome ?? String(fornecedorId) } : null);
        selecoes.setFuncionarioSelecionado(
            funcionarioId
                ? {
                      id: funcionarioId,
                      nome: funcionarioNome ?? String(funcionarioId),
                      salario: parcela?.funcionario?.salario,
                  }
                : null,
        );

        if (isEdit) {
            setData({
                descricao: toInputValue(parcela?.descricao),
                data_competencia: toInputValue(parcela?.data_competencia) || hojeISO(),
                valor: toMoneyFormValue(parcela?.valor),
                valor_pago: toMoneyFormValue(parcela?.valor_pago),
                tipo: abaInicial,
                categoria_id: idNumericoOuNull(categoriaId),
                produto_id: idNumericoOuNull(produtoId),
                fornecedor_id: idNumericoOuNull(fornecedorId),
                funcionario_id: idNumericoOuNull(funcionarioId),
                conta_id: idNumericoOuNull(contaId),
                quantidade: toInputValue(parcela?.quantidade ?? 1),
                id: parcela?.id ?? null,
                forma_pagamento_id: idNumericoOuNull(parcela?.forma_pagamento?.id),
            });
        } else {
            reset();
            clearErrors();
            setData('data_competencia', hojeISO());
            setData('tipo', abaInicial);
            setData('produto_id', null);
            setData('funcionario_id', null);
            setData('forma_pagamento_id', idFormaPadrao);
            selecoes.setProdutoSelecionado(null);
            selecoes.setFuncionarioSelecionado(null);
            if (abaInicial === 'DESPESA') {
                void aplicarProdutoPadrao();
            } else {
                aplicarReceitaPadrao();
            }
            void aplicarContaPadrao();
        }
    }, [open, mode, parcela?.id]);

    useEffect(() => {
        if (!open || mode === 'edit') return;
        selecoes.rascunhoCategoria.setNome(null);
        selecoes.rascunhoCategoria.setFoco(null);
        if (activeTab === 'DESPESA') {
            void aplicarProdutoPadrao();
        } else {
            aplicarReceitaPadrao();
            selecoes.setProdutoSelecionado(null);
            setData('produto_id', null);
            selecoes.setFuncionarioSelecionado(null);
            setData('funcionario_id', null);
        }
    }, [activeTab]);
}
