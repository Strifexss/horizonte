import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog } from '@/components/ui/dialog';
import { FormDialogBody, FormDialogContent, FormDialogFooter, FormDialogHeader } from '@/components/ui/form-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MoneyInput from '@/components/ui/money-input';
import { formatCurrency, parseQuantidade, type VendaItemRascunho, type VendaPagamentoRascunho } from '@/components/vendas/types';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const QUANTIDADE_DIGITADA = /^\d*([.,]\d{0,3})?$/;

export type CorrecaoDaVenda = {
    itens: VendaItemRascunho[];
    pagamentos: VendaPagamentoRascunho[];
    atualizarPrecoProdutoIds: number[];
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itens: VendaItemRascunho[];
    pagamentos: VendaPagamentoRascunho[];
    formasPagamento: FormaPagamentoItem[];
    errors: Partial<Record<string, string>>;
    resumo: string;
    onConfirmar: (correcao: CorrecaoDaVenda) => void;
};

type Pendencias = {
    precos: Set<string>;
    quantidades: Set<string>;
    produtosInvalidos: Map<string, string>;
    pagamentos: Map<string, string>;
    gerais: string[];
};

/** Itens sem preço já são pendência antes de ir ao servidor; o resto vem dos erros de validação. */
export function pendenciasDaVenda(itens: VendaItemRascunho[], pagamentos: VendaPagamentoRascunho[], errors: Props['errors']): Pendencias {
    const pendencias: Pendencias = { precos: new Set(), quantidades: new Set(), produtosInvalidos: new Map(), pagamentos: new Map(), gerais: [] };

    itens.forEach((item, indice) => {
        if (!item.valor_unitario || item.valor_unitario <= 0 || errors[`itens.${indice}.valor_unitario`]) {
            pendencias.precos.add(item.chave);
        }
        if (parseQuantidade(item.quantidade) <= 0 || errors[`itens.${indice}.quantidade`]) {
            pendencias.quantidades.add(item.chave);
        }
        const erroProduto = errors[`itens.${indice}.produto_id`];
        if (erroProduto) {
            pendencias.produtosInvalidos.set(item.chave, erroProduto);
        }
    });

    pagamentos.forEach((pagamento, indice) => {
        const erro = errors[`pagamentos.${indice}.valor`] ?? errors[`pagamentos.${indice}.forma_pagamento_id`];
        if (erro) {
            pendencias.pagamentos.set(pagamento.chave, erro);
        }
    });

    for (const campo of ['cliente_id', 'itens', 'pagamentos', 'observacao', 'venda']) {
        if (errors[campo]) {
            pendencias.gerais.push(errors[campo] as string);
        }
    }

    return pendencias;
}

export function temPendencias(pendencias: Pendencias): boolean {
    return (
        pendencias.precos.size +
            pendencias.quantidades.size +
            pendencias.produtosInvalidos.size +
            pendencias.pagamentos.size +
            pendencias.gerais.length >
        0
    );
}

/** Mostra só o que impede salvar a venda, com os campos na frente da pessoa. */
export default function VendaCorrecaoModal({ open, onOpenChange, itens, pagamentos, formasPagamento, errors, resumo, onConfirmar }: Props) {
    const [rascunhoItens, setRascunhoItens] = useState(itens);
    const [rascunhoPagamentos, setRascunhoPagamentos] = useState(pagamentos);
    const [salvarNoCadastro, setSalvarNoCadastro] = useState(true);
    const [pendencias, setPendencias] = useState(() => pendenciasDaVenda(itens, pagamentos, errors));

    useEffect(() => {
        if (open) {
            setRascunhoItens(itens);
            setRascunhoPagamentos(pagamentos);
            setPendencias(pendenciasDaVenda(itens, pagamentos, errors));
        }
        // Só recalcula ao abrir: durante a correção a lista de pendências fica fixa.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const itensComPendencia = rascunhoItens.filter(
        (item) => pendencias.precos.has(item.chave) || pendencias.quantidades.has(item.chave) || pendencias.produtosInvalidos.has(item.chave),
    );
    const pagamentosComPendencia = rascunhoPagamentos.filter((pagamento) => pendencias.pagamentos.has(pagamento.chave));

    const faltando =
        itensComPendencia.filter(
            (item) =>
                pendencias.produtosInvalidos.has(item.chave) ||
                (pendencias.precos.has(item.chave) && !(item.valor_unitario && item.valor_unitario > 0)) ||
                (pendencias.quantidades.has(item.chave) && parseQuantidade(item.quantidade) <= 0),
        ).length + pagamentosComPendencia.filter((pagamento) => !(pagamento.valor && pagamento.valor > 0)).length;
    const temPrecos = pendencias.precos.size > 0;

    function atualizarItem(chave: string, patch: Partial<VendaItemRascunho>): void {
        setRascunhoItens((atuais) => atuais.map((item) => (item.chave === chave ? { ...item, ...patch } : item)));
    }

    function removerItem(chave: string): void {
        setRascunhoItens((atuais) => atuais.filter((item) => item.chave !== chave));
        setPendencias((atual) => {
            const produtosInvalidos = new Map(atual.produtosInvalidos);
            produtosInvalidos.delete(chave);
            const precos = new Set(atual.precos);
            precos.delete(chave);
            const quantidades = new Set(atual.quantidades);
            quantidades.delete(chave);

            return { ...atual, produtosInvalidos, precos, quantidades };
        });
    }

    function confirmar(): void {
        const corrigidos = rascunhoItens.filter((item) => pendencias.precos.has(item.chave)).map((item) => item.produto.id);

        onConfirmar({
            itens: rascunhoItens,
            pagamentos: rascunhoPagamentos,
            atualizarPrecoProdutoIds: salvarNoCadastro ? corrigidos : [],
        });
    }

    const nomeDaForma = (id: number) => formasPagamento.find((forma) => forma.id === id)?.nome ?? `Forma #${id}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <FormDialogContent className="md:w-[480px]">
                <FormDialogHeader title="Corrigir venda" description={resumo} />

                <FormDialogBody>
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>
                            {faltando > 0
                                ? `Falta pouco: corrija ${faltando} ${faltando === 1 ? 'ponto' : 'pontos'} para concluir a venda.`
                                : 'Tudo certo. Pode salvar.'}
                        </span>
                    </div>

                    {pendencias.gerais.map((mensagem) => (
                        <p key={mensagem} className="text-sm text-red-600">
                            {mensagem}
                        </p>
                    ))}

                    {itensComPendencia.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-200">Produtos</span>
                            {itensComPendencia.map((item) => {
                                const precoOk = Boolean(item.valor_unitario && item.valor_unitario > 0);
                                const invalido = pendencias.produtosInvalidos.get(item.chave);

                                return (
                                    <div key={item.chave} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-medium">{item.produto.nome}</span>
                                            {invalido ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() => removerItem(item.chave)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remover da venda
                                                </Button>
                                            ) : null}
                                        </div>
                                        {invalido ? <p className="text-xs text-red-600">{invalido}</p> : null}
                                        {pendencias.precos.has(item.chave) ? (
                                            <div className="flex items-center gap-3">
                                                <Label
                                                    htmlFor={`correcao-preco-${item.chave}`}
                                                    className="text-muted-foreground w-24 shrink-0 text-xs"
                                                >
                                                    Preço unitário
                                                </Label>
                                                <MoneyInput
                                                    id={`correcao-preco-${item.chave}`}
                                                    showSymbol
                                                    value={item.valor_unitario}
                                                    onValueChange={(valor) => atualizarItem(item.chave, { valor_unitario: valor })}
                                                    placeholder="R$ 0,00"
                                                    className={`h-12 flex-1 text-base ${precoOk ? 'border-green-600' : 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30'}`}
                                                />
                                            </div>
                                        ) : null}
                                        {pendencias.quantidades.has(item.chave) ? (
                                            <div className="flex items-center gap-3">
                                                <Label htmlFor={`correcao-qtd-${item.chave}`} className="text-muted-foreground w-24 shrink-0 text-xs">
                                                    Quantidade
                                                </Label>
                                                <Input
                                                    id={`correcao-qtd-${item.chave}`}
                                                    inputMode="decimal"
                                                    value={item.quantidade}
                                                    onChange={(e) => {
                                                        if (QUANTIDADE_DIGITADA.test(e.target.value)) {
                                                            atualizarItem(item.chave, { quantidade: e.target.value });
                                                        }
                                                    }}
                                                    className="h-12 flex-1 text-base"
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                            {temPrecos ? (
                                <div className="flex min-h-11 items-center gap-2">
                                    <Checkbox
                                        id="correcao-salvar-cadastro"
                                        checked={salvarNoCadastro}
                                        onCheckedChange={(checked) => setSalvarNoCadastro(checked === true)}
                                    />
                                    <Label htmlFor="correcao-salvar-cadastro">Salvar também como preço de venda no cadastro do produto</Label>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {pagamentosComPendencia.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-200">Pagamentos</span>
                            {pagamentosComPendencia.map((pagamento) => (
                                <div key={pagamento.chave} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                        <Label htmlFor={`correcao-pag-${pagamento.chave}`} className="w-24 shrink-0 text-sm">
                                            {nomeDaForma(pagamento.forma_pagamento_id)}
                                        </Label>
                                        <MoneyInput
                                            id={`correcao-pag-${pagamento.chave}`}
                                            showSymbol
                                            value={pagamento.valor}
                                            onValueChange={(valor) =>
                                                setRascunhoPagamentos((atuais) =>
                                                    atuais.map((atual) =>
                                                        atual.chave === pagamento.chave ? { ...atual, valor, acompanhaTotal: false } : atual,
                                                    ),
                                                )
                                            }
                                            className="h-12 flex-1 text-base"
                                        />
                                    </div>
                                    <p className="text-xs text-red-600">{pendencias.pagamentos.get(pagamento.chave)}</p>
                                </div>
                            ))}
                            <p className="text-muted-foreground text-xs">
                                Total pago: {formatCurrency(rascunhoPagamentos.reduce((soma, atual) => soma + (atual.valor ?? 0), 0))}
                            </p>
                        </div>
                    ) : null}
                </FormDialogBody>

                <FormDialogFooter className="md:border-t md:pt-3">
                    <Button type="button" variant="secondary" className="h-12 w-28 shrink-0 md:h-10" onClick={() => onOpenChange(false)}>
                        Voltar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        className="h-12 flex-1 justify-center uppercase md:h-10"
                        disabled={faltando > 0}
                        onClick={confirmar}
                    >
                        Corrigir e salvar
                    </Button>
                </FormDialogFooter>
            </FormDialogContent>
        </Dialog>
    );
}
