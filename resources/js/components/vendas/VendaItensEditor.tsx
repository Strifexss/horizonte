import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';
import { Input } from '@/components/ui/input';
import MoneyInput from '@/components/ui/money-input';
import { quantidadeTexto, somarProduto } from '@/components/vendas/itensDaVenda';
import { formatCurrency, parseQuantidade, type ProdutoParaVenda, type VendaItemRascunho } from '@/components/vendas/types';
import { Minus, Plus, Star, X } from 'lucide-react';

const QUANTIDADE_DIGITADA = /^\d*([.,]\d{0,3})?$/;

type Props = {
    itens: VendaItemRascunho[];
    onChange: (itens: VendaItemRascunho[]) => void;
    errors: Partial<Record<string, string>>;
    disabled?: boolean;
    favoritos?: ProdutoParaVenda[];
    /** Só as linhas (produto, quantidade, preço). Sem favoritos nem busca de adicionar. */
    somenteLinhas?: boolean;
};

async function loadProdutos(q: string): Promise<ProdutoParaVenda[]> {
    const res = await fetch(`${route('vendas.produtos')}?q=${encodeURIComponent(q)}`);
    if (!res.ok) {
        return [];
    }

    return res.json();
}

function rotuloComCodigo(produto: { nome: string; codigo?: string | null }): string {
    return produto.codigo ? `${produto.codigo} · ${produto.nome}` : produto.nome;
}

function erroDaLinha(errors: Props['errors'], index: number): string | undefined {
    return errors[`itens.${index}.produto_id`] ?? errors[`itens.${index}.quantidade`] ?? errors[`itens.${index}.valor_unitario`];
}

export default function VendaItensEditor({ itens, onChange, errors, disabled = false, favoritos = [], somenteLinhas = false }: Props) {
    const quantidadePorProduto = new Map(itens.map((item) => [item.produto.id, parseQuantidade(item.quantidade)]));

    function adicionarProduto(produto: ProdutoParaVenda): void {
        onChange(somarProduto(itens, produto, 1));
    }

    function trocarProduto(linha: VendaItemRascunho, produto: ProdutoParaVenda): void {
        if (produto.id === linha.produto.id) {
            return;
        }

        const outra = itens.find((item) => item.produto.id === produto.id && item.chave !== linha.chave);

        if (outra) {
            onChange(
                itens
                    .filter((item) => item.chave !== linha.chave)
                    .map((item) =>
                        item.chave === outra.chave
                            ? { ...item, quantidade: quantidadeTexto(parseQuantidade(item.quantidade) + parseQuantidade(linha.quantidade)) }
                            : item,
                    ),
            );
            return;
        }

        atualizar(linha.chave, { produto: { id: produto.id, nome: produto.nome }, valor_unitario: Number(produto.preco_venda) });
    }

    function atualizar(chave: string, patch: Partial<VendaItemRascunho>): void {
        onChange(itens.map((item) => (item.chave === chave ? { ...item, ...patch } : item)));
    }

    function remover(chave: string): void {
        onChange(itens.filter((item) => item.chave !== chave));
    }

    return (
        <div className="flex flex-col gap-2">
            {!somenteLinhas && favoritos.length > 0 ? (
                <div className="flex flex-col gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-200">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                        Favoritos
                    </span>
                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                        {favoritos.map((produto) => {
                            const quantidade = quantidadePorProduto.get(produto.id) ?? 0;
                            const naVenda = quantidade > 0;

                            return (
                                <button
                                    key={produto.id}
                                    type="button"
                                    disabled={disabled}
                                    aria-label={`Adicionar ${produto.nome}`}
                                    onClick={() => adicionarProduto(produto)}
                                    className={`flex min-h-12 min-w-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-colors disabled:opacity-50 ${
                                        naVenda
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                                            : 'border-sidebar-border/70 bg-background hover:bg-muted'
                                    }`}
                                >
                                    <span className="flex min-w-0 flex-1 flex-col">
                                        <span className="truncate text-sm font-medium">{produto.nome}</span>
                                        <span className="text-muted-foreground text-xs">{formatCurrency(Number(produto.preco_venda))}</span>
                                    </span>
                                    {naVenda ? (
                                        <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
                                            {quantidadeTexto(quantidade)}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            {somenteLinhas ? null : (
                <div className="border-sidebar-border/70 rounded-lg border p-2">
                    <AsyncSelect
                        value={null}
                        onChange={(produto) => {
                            if (produto) {
                                adicionarProduto(produto as ProdutoParaVenda);
                            }
                        }}
                        loadOptions={loadProdutos}
                        formatOptionText={rotuloComCodigo}
                        placeholder="Adicionar produto (nome ou código)"
                        isClearable={false}
                        isDisabled={disabled}
                        selectFirstOnEnter
                        keepFocusOnSelect
                    />
                    <InputError message={errors.itens} className="mt-1" />
                </div>
            )}

            {itens.map((item, index) => {
                const quantidade = parseQuantidade(item.quantidade);

                return (
                    <div key={item.chave} className="border-sidebar-border/70 rounded-lg border p-2">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto]">
                            <div className="col-start-1 row-start-1 min-w-0">
                                <AsyncSelect
                                    value={item.produto}
                                    onChange={(produto) => {
                                        if (produto) {
                                            trocarProduto(item, produto as ProdutoParaVenda);
                                        }
                                    }}
                                    loadOptions={loadProdutos}
                                    formatOptionText={rotuloComCodigo}
                                    placeholder="Produto"
                                    isClearable={false}
                                    isDisabled={disabled}
                                />
                            </div>

                            <button
                                type="button"
                                aria-label={`Remover ${item.produto.nome}`}
                                className="col-start-2 row-start-1 inline-flex h-10 w-10 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 md:col-start-3"
                                onClick={() => remover(item.chave)}
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="col-span-2 row-start-2 flex min-w-0 items-center gap-2 md:col-span-1 md:col-start-2 md:row-start-1">
                                <div className="border-input flex h-10 shrink-0 items-center overflow-hidden rounded-md border">
                                    <button
                                        type="button"
                                        aria-label="Diminuir quantidade"
                                        className="bg-muted/50 hover:bg-muted inline-flex h-full w-9 items-center justify-center disabled:opacity-40"
                                        disabled={disabled || quantidade <= 1}
                                        onClick={() => atualizar(item.chave, { quantidade: quantidadeTexto(quantidade - 1) })}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <Input
                                        aria-label={`Quantidade de ${item.produto.nome}`}
                                        inputMode="decimal"
                                        className="h-full w-16 rounded-none border-0 text-center focus-visible:ring-0 focus-visible:ring-offset-0"
                                        value={item.quantidade}
                                        disabled={disabled}
                                        onChange={(e) => {
                                            if (QUANTIDADE_DIGITADA.test(e.target.value)) {
                                                atualizar(item.chave, { quantidade: e.target.value });
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        aria-label="Aumentar quantidade"
                                        className="bg-muted/50 hover:bg-muted inline-flex h-full w-9 items-center justify-center disabled:opacity-40"
                                        disabled={disabled}
                                        onClick={() => atualizar(item.chave, { quantidade: quantidadeTexto(quantidade + 1) })}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <MoneyInput
                                    aria-label={`Valor unitário de ${item.produto.nome}`}
                                    className="min-w-0 flex-1 md:w-32 md:flex-none"
                                    showSymbol
                                    value={item.valor_unitario}
                                    onValueChange={(valor) => atualizar(item.chave, { valor_unitario: valor })}
                                    placeholder="R$ 0,00"
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                        <InputError message={erroDaLinha(errors, index)} className="mt-1" />
                    </div>
                );
            })}
        </div>
    );
}
