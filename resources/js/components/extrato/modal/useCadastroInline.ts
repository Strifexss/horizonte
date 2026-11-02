import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { ExtratoFlash, TipoLancamento } from './types';
import type { LancamentoSelecoes } from './useLancamentoSelecoes';

function flashDaPagina(page: { props: unknown }): ExtratoFlash | undefined {
    return (page.props as { flash?: ExtratoFlash }).flash;
}

/**
 * Cadastro rápido (produto, funcionário, fornecedor, categoria) feito sem sair do lançamento:
 * envia o rascunho, e quando o backend devolve o item criado no `flash` ele vira a seleção do campo.
 */
export function useCadastroInline(selecoes: LancamentoSelecoes, tipo: TipoLancamento) {
    const [criandoInline, setCriandoInline] = useState(false);
    const { rascunhoProduto, rascunhoFuncionario, rascunhoFornecedor, rascunhoCategoria } = selecoes;

    const confirmarProdutoInline = () => {
        const nome = rascunhoProduto.nome?.trim();
        if (!nome || !rascunhoProduto.valor) {
            return;
        }
        setCriandoInline(true);
        router.post(
            route('produtos.store'),
            { nome, preco_compra: rascunhoProduto.valor },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    setCriandoInline(false);
                    const criado = flashDaPagina(page)?.produto_criado;
                    if (criado) {
                        rascunhoProduto.setNome(null);
                        rascunhoProduto.setValor('');
                        selecoes.alterarProduto({
                            id: criado.id,
                            nome: criado.nome,
                            preco_compra: criado.preco_compra,
                        });
                    }
                },
                onError: () => setCriandoInline(false),
            },
        );
    };

    const confirmarFuncionarioInline = () => {
        const nome = rascunhoFuncionario.nome?.trim();
        if (!nome || !rascunhoFuncionario.valor) {
            return;
        }
        setCriandoInline(true);
        router.post(
            route('funcionarios.store'),
            { nome, salario: rascunhoFuncionario.valor },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    setCriandoInline(false);
                    const criado = flashDaPagina(page)?.funcionario_criado;
                    if (criado) {
                        rascunhoFuncionario.setNome(null);
                        rascunhoFuncionario.setValor('');
                        selecoes.alterarFuncionario({
                            id: criado.id,
                            nome: criado.nome,
                            salario: criado.salario,
                        });
                    }
                },
                onError: () => setCriandoInline(false),
            },
        );
    };

    const confirmarFornecedorInline = () => {
        const nome = rascunhoFornecedor.nome?.trim() ?? null;
        if (!nome) return;
        setCriandoInline(true);
        router.post(
            route('fornecedores.store'),
            { nome },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    setCriandoInline(false);
                    // Sempre limpar o rascunho ao receber sucesso,
                    // mesmo que o flash não venha por algum motivo.
                    rascunhoFornecedor.setNome(null);
                    rascunhoFornecedor.setFoco(null);
                    const criado = flashDaPagina(page)?.fornecedor_criado;
                    if (criado) {
                        selecoes.alterarFornecedor({
                            id: criado.id,
                            nome: criado.nome,
                        });
                    }
                },
                onError: () => setCriandoInline(false),
            },
        );
    };

    const confirmarCategoriaInline = () => {
        const nome = rascunhoCategoria.nome?.trim();
        if (!nome) {
            return;
        }
        setCriandoInline(true);
        router.post(
            route('categorias.store'),
            { nome, tipo: tipo.toLowerCase(), padrao: 0 },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    setCriandoInline(false);
                    const criado = flashDaPagina(page)?.categoria_criada;
                    if (criado) {
                        rascunhoCategoria.setNome(null);
                        selecoes.alterarCategoria({
                            id: criado.id,
                            nome: criado.nome,
                            padrao: criado.padrao ?? 0,
                        });
                    }
                },
                onError: () => setCriandoInline(false),
            },
        );
    };

    return { criandoInline, confirmarProdutoInline, confirmarFuncionarioInline, confirmarFornecedorInline, confirmarCategoriaInline };
}

export type CadastroInline = ReturnType<typeof useCadastroInline>;
