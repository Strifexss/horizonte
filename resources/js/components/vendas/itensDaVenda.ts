import { novaChave, parseQuantidade, type ProdutoParaVenda, type VendaItemRascunho } from '@/components/vendas/types';

export function quantidadeTexto(value: number): string {
    return String(Number(value.toFixed(3)));
}

export function quantidadeDoProduto(itens: VendaItemRascunho[], produtoId: number): number {
    const item = itens.find((linha) => linha.produto.id === produtoId);

    return item ? parseQuantidade(item.quantidade) : 0;
}

/**
 * Soma `delta` à quantidade do produto na venda: cria a linha quando ele não está nela
 * e remove a linha quando a quantidade chega a zero.
 */
export function somarProduto(itens: VendaItemRascunho[], produto: ProdutoParaVenda, delta: number): VendaItemRascunho[] {
    const existente = itens.find((item) => item.produto.id === produto.id);

    if (!existente) {
        if (delta <= 0) {
            return itens;
        }

        return [
            ...itens,
            {
                chave: novaChave(),
                produto: { id: produto.id, nome: produto.nome },
                quantidade: quantidadeTexto(delta),
                valor_unitario: Number(produto.preco_venda),
            },
        ];
    }

    const quantidade = parseQuantidade(existente.quantidade) + delta;
    if (quantidade <= 0) {
        return itens.filter((item) => item.chave !== existente.chave);
    }

    return itens.map((item) => (item.chave === existente.chave ? { ...item, quantidade: quantidadeTexto(quantidade) } : item));
}
