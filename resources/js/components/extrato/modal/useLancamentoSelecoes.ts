import { useEffect, useRef, useState } from 'react';
import { isCategoriaProduto, isCategoriaSalario, nomeDaOpcaoNova, toMoneyFormValue } from './lancamentoValores';
import type { DefinirDadosLancamento, ExtratoOpcao, TipoLancamento } from './types';
import { useRascunhoInline } from './useRascunhoInline';

const ID_RASCUNHO = '__draft__';
const ATRASO_FOCO_PRODUTO_MS = 50;

type Params = {
    open: boolean;
    activeTab: TipoLancamento;
    quantidade: string;
    setData: DefinirDadosLancamento;
};

/**
 * Seleções do lançamento (conta, categoria, produto, funcionário, fornecedor), seus rascunhos de cadastro
 * rápido e as regras que ligam um campo ao outro (ex.: escolher produto limpa funcionário).
 */
export function useLancamentoSelecoes({ open, activeTab, quantidade, setData }: Params) {
    const [contaSelecionada, setContaSelecionada] = useState<ExtratoOpcao | null>(null);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<ExtratoOpcao | null>(null);
    const [produtoSelecionado, setProdutoSelecionado] = useState<ExtratoOpcao | null>(null);
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<ExtratoOpcao | null>(null);
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState<ExtratoOpcao | null>(null);
    const produtoSelectRef = useRef<{ focus: () => void } | null>(null);
    const rascunhoProduto = useRascunhoInline();
    const rascunhoFuncionario = useRascunhoInline();
    const rascunhoCategoria = useRascunhoInline();
    const rascunhoFornecedor = useRascunhoInline();

    const mostrarProduto = isCategoriaProduto(categoriaSelecionada);
    const mostrarFuncionario = isCategoriaSalario(categoriaSelecionada);

    useEffect(() => {
        if (!open || !mostrarProduto || activeTab !== 'DESPESA') {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            produtoSelectRef.current?.focus();
        }, ATRASO_FOCO_PRODUTO_MS);

        return () => window.clearTimeout(timeoutId);
    }, [open, mostrarProduto, activeTab]);

    const alterarConta = (conta: ExtratoOpcao | null) => {
        setContaSelecionada(conta);
        setData('conta_id', conta ? Number(conta.id) : null);
    };

    const alterarCategoria = (categoria: ExtratoOpcao | null) => {
        const nomeNovo = nomeDaOpcaoNova(categoria);
        if (nomeNovo !== null) {
            rascunhoCategoria.setNome(nomeNovo);
            setCategoriaSelecionada({ id: ID_RASCUNHO, nome: nomeNovo });
            setData('categoria_id', null);
            rascunhoCategoria.setFoco('nome');
            return;
        }

        rascunhoCategoria.setNome(null);
        rascunhoCategoria.setFoco(null);
        setCategoriaSelecionada(categoria);
        setData('categoria_id', categoria ? Number(categoria.id) : null);

        if (!isCategoriaProduto(categoria)) {
            setProdutoSelecionado(null);
            setData('produto_id', null);
        }

        if (!isCategoriaSalario(categoria)) {
            setFuncionarioSelecionado(null);
            setData('funcionario_id', null);
        }
    };

    const alterarProduto = (produto: ExtratoOpcao | null) => {
        const nomeNovo = nomeDaOpcaoNova(produto);
        if (nomeNovo !== null) {
            rascunhoProduto.setNome(nomeNovo);
            rascunhoProduto.setValor('');
            setProdutoSelecionado({ id: ID_RASCUNHO, nome: nomeNovo });
            setData('produto_id', null);
            setData('descricao', 'Compra');
            rascunhoProduto.setFoco('valor');
            return;
        }

        rascunhoProduto.setNome(null);
        rascunhoProduto.setValor('');
        rascunhoProduto.setFoco(null);
        setProdutoSelecionado(produto);
        if (!produto) {
            setData('produto_id', null);
            return;
        }

        const preco = produto.preco_compra !== undefined && produto.preco_compra !== null ? String(produto.preco_compra) : null;
        setData('produto_id', Number(produto.id));
        setData('funcionario_id', null);
        setFuncionarioSelecionado(null);
        rascunhoFuncionario.setNome(null);
        setData('descricao', 'Compra');
        if (preco !== null) {
            setData('valor', toMoneyFormValue(preco));
            const qtd = Number(quantidade) || 1;
            const total = (parseFloat(preco.replace(',', '.') || preco) * qtd).toFixed(2);
            setData('valor_pago', total);
        }

        let fornecedor: ExtratoOpcao | null = null;
        const fornecedorDoProduto = produto.fornecedor;
        const idFornecedorDoProduto = produto.fornecedor_id ?? produto.fornecedorId ?? null;
        if (fornecedorDoProduto) {
            fornecedor = { id: fornecedorDoProduto.id, nome: fornecedorDoProduto.nome ?? String(fornecedorDoProduto.id) };
        } else if (idFornecedorDoProduto) {
            fornecedor = { id: idFornecedorDoProduto, nome: String(idFornecedorDoProduto) };
        }
        if (fornecedor && fornecedor.id) {
            setFornecedorSelecionado(fornecedor);
            setData('fornecedor_id', Number(fornecedor.id));
        } else {
            setFornecedorSelecionado(null);
            setData('fornecedor_id', null);
        }
    };

    const alterarFornecedor = (fornecedor: ExtratoOpcao | null) => {
        const nomeNovo = nomeDaOpcaoNova(fornecedor);
        if (nomeNovo !== null) {
            rascunhoFornecedor.setNome(nomeNovo);
            setFornecedorSelecionado({ id: ID_RASCUNHO, nome: nomeNovo });
            setData('fornecedor_id', null);
            rascunhoFornecedor.setFoco('nome');
            return;
        }

        setFornecedorSelecionado(fornecedor);
        setData('fornecedor_id', fornecedor ? Number(fornecedor.id) : null);
    };

    const alterarFuncionario = (funcionario: ExtratoOpcao | null) => {
        const nomeNovo = nomeDaOpcaoNova(funcionario);
        if (nomeNovo !== null) {
            rascunhoFuncionario.setNome(nomeNovo);
            rascunhoFuncionario.setValor('');
            setFuncionarioSelecionado({ id: ID_RASCUNHO, nome: nomeNovo });
            setData('funcionario_id', null);
            setData('descricao', `Salário - ${nomeNovo}`);
            rascunhoFuncionario.setFoco('valor');
            return;
        }

        rascunhoFuncionario.setNome(null);
        rascunhoFuncionario.setValor('');
        rascunhoFuncionario.setFoco(null);
        setFuncionarioSelecionado(funcionario);
        if (!funcionario) {
            setData('funcionario_id', null);
            return;
        }

        const salario = funcionario.salario !== undefined && funcionario.salario !== null ? String(funcionario.salario) : null;
        setData('funcionario_id', Number(funcionario.id));
        setData('produto_id', null);
        setProdutoSelecionado(null);
        rascunhoProduto.setNome(null);
        setData('descricao', `Salário - ${funcionario.nome}`);
        if (salario !== null) {
            const valor = toMoneyFormValue(salario);
            setData('valor', valor);
            setData('valor_pago', valor);
        }
    };

    const alterarNomeRascunhoCategoria = (nome: string) => {
        rascunhoCategoria.setNome(nome);
        setCategoriaSelecionada(nome ? { id: ID_RASCUNHO, nome } : null);
    };

    const alterarNomeRascunhoProduto = (nome: string) => {
        rascunhoProduto.setNome(nome);
        setProdutoSelecionado(nome ? { id: ID_RASCUNHO, nome } : null);
        setData('descricao', 'Compra');
    };

    const alterarNomeRascunhoFuncionario = (nome: string) => {
        rascunhoFuncionario.setNome(nome);
        setFuncionarioSelecionado(nome ? { id: ID_RASCUNHO, nome } : null);
        setData('descricao', nome ? `Salário - ${nome}` : 'Salário');
    };

    const alterarNomeRascunhoFornecedor = (nome: string) => {
        rascunhoFornecedor.setNome(nome);
        setFornecedorSelecionado(nome ? { id: ID_RASCUNHO, nome } : null);
    };

    const iniciarCadastroCategoria = () => {
        setCategoriaSelecionada(null);
        setData('categoria_id', null);
        rascunhoCategoria.setNome('');
        rascunhoCategoria.setFoco('nome');
    };

    const cancelarCadastroCategoria = () => {
        rascunhoCategoria.setNome(null);
        rascunhoCategoria.setFoco(null);
        setCategoriaSelecionada(null);
        setData('categoria_id', null);
    };

    const iniciarCadastroProduto = () => {
        rascunhoFuncionario.setNome(null);
        rascunhoFuncionario.setValor('');
        rascunhoFuncionario.setFoco(null);
        setFuncionarioSelecionado(null);
        setData('funcionario_id', null);
        setProdutoSelecionado(null);
        setData('produto_id', null);
        rascunhoProduto.setNome('');
        rascunhoProduto.setValor('');
        rascunhoProduto.setFoco('nome');
        setData('descricao', 'Compra');
    };

    const cancelarCadastroProduto = () => {
        rascunhoProduto.setNome(null);
        rascunhoProduto.setValor('');
        setProdutoSelecionado(null);
        setData('produto_id', null);
    };

    const iniciarCadastroFuncionario = () => {
        rascunhoProduto.setNome(null);
        rascunhoProduto.setValor('');
        rascunhoProduto.setFoco(null);
        setProdutoSelecionado(null);
        setData('produto_id', null);
        setFuncionarioSelecionado(null);
        setData('funcionario_id', null);
        rascunhoFuncionario.setNome('');
        rascunhoFuncionario.setValor('');
        rascunhoFuncionario.setFoco('nome');
        setData('descricao', 'Salário');
    };

    const cancelarCadastroFuncionario = () => {
        rascunhoFuncionario.setNome(null);
        rascunhoFuncionario.setValor('');
        setFuncionarioSelecionado(null);
        setData('funcionario_id', null);
    };

    const iniciarCadastroFornecedor = () => {
        rascunhoFornecedor.setNome('');
        rascunhoFornecedor.setFoco('nome');
    };

    const cancelarCadastroFornecedor = () => {
        rascunhoFornecedor.setNome(null);
        rascunhoFornecedor.setFoco(null);
    };

    return {
        contaSelecionada,
        setContaSelecionada,
        categoriaSelecionada,
        setCategoriaSelecionada,
        produtoSelecionado,
        setProdutoSelecionado,
        funcionarioSelecionado,
        setFuncionarioSelecionado,
        fornecedorSelecionado,
        setFornecedorSelecionado,
        produtoSelectRef,
        rascunhoProduto,
        rascunhoFuncionario,
        rascunhoCategoria,
        rascunhoFornecedor,
        mostrarProduto,
        mostrarFuncionario,
        alterarConta,
        alterarCategoria,
        alterarProduto,
        alterarFornecedor,
        alterarFuncionario,
        alterarNomeRascunhoCategoria,
        alterarNomeRascunhoProduto,
        alterarNomeRascunhoFuncionario,
        alterarNomeRascunhoFornecedor,
        iniciarCadastroCategoria,
        cancelarCadastroCategoria,
        iniciarCadastroProduto,
        cancelarCadastroProduto,
        iniciarCadastroFuncionario,
        cancelarCadastroFuncionario,
        iniciarCadastroFornecedor,
        cancelarCadastroFornecedor,
    };
}

export type LancamentoSelecoes = ReturnType<typeof useLancamentoSelecoes>;
