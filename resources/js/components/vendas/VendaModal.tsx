import ContasForm from '@/components/contas/ContasForm';
import FormasPagamentoForm from '@/components/formas-pagamento/FormasPagamentoForm';
import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    VENDA_STATUS_META,
    emCentavos,
    formatCurrency,
    formatDataVenda,
    formatQuantidade,
    novaChave,
    parseQuantidade,
    type Venda,
    type VendaItemRascunho,
    type VendaPagamentoRascunho,
} from '@/components/vendas/types';
import VendaItensEditor from '@/components/vendas/VendaItensEditor';
import VendaPagamentosEditor, { pagamentosComForma } from '@/components/vendas/VendaPagamentosEditor';
import VendaResumo, { type VendaResumoLinha } from '@/components/vendas/VendaResumo';
import { useForm } from '@inertiajs/react';
import { Ban } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

type VendaFormData = {
    itens: VendaItemRascunho[];
    pagamentos: VendaPagamentoRascunho[];
    observacao: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    venda: Venda | null;
    formasPagamento: FormaPagamentoItem[];
    possuiConta: boolean;
    onCancelar: (venda: Venda) => void;
};

function rascunhoDaVenda(venda: Venda | null): VendaFormData {
    if (!venda) {
        return { itens: [], pagamentos: [], observacao: '' };
    }

    return {
        itens: venda.itens.map((item) => ({
            chave: novaChave(),
            produto: { id: item.produto_id, nome: item.produto?.nome ?? `Produto #${item.produto_id}` },
            quantidade: item.quantidade,
            valor_unitario: Number(item.valor_unitario),
        })),
        pagamentos: venda.pagamentos.map((pagamento) => ({
            chave: novaChave(),
            forma_pagamento_id: pagamento.forma_pagamento_id,
            valor: Number(pagamento.valor),
            acompanhaTotal: false,
        })),
        observacao: venda.observacao ?? '',
    };
}

function somaEmCentavos(valores: number[]): number {
    return valores.reduce((soma, valor) => soma + emCentavos(valor), 0);
}

function VendaSomenteLeitura({ venda }: { venda: Venda }) {
    const linhas: VendaResumoLinha[] = venda.itens.map((item) => ({
        chave: item.id,
        nome: item.produto?.nome ?? `Produto #${item.produto_id}`,
        quantidade: parseQuantidade(item.quantidade),
        valorTotal: Number(item.valor_total),
    }));

    return (
        <div className="flex flex-col gap-4">
            <VendaResumo linhas={linhas} total={Number(venda.total)} />
            <div className="flex flex-col gap-2">
                <span className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-200">Pagamentos</span>
                {venda.pagamentos.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhum pagamento registrado.</p>
                ) : (
                    venda.pagamentos.map((pagamento) => (
                        <div key={pagamento.id} className="flex items-center justify-between text-sm">
                            <span>{pagamento.forma_pagamento?.nome ?? `Forma #${pagamento.forma_pagamento_id}`}</span>
                            <span className="font-semibold">{formatCurrency(Number(pagamento.valor))}</span>
                        </div>
                    ))
                )}
            </div>
            {venda.observacao ? <p className="text-muted-foreground text-sm">{venda.observacao}</p> : null}
            {venda.status === 'cancelada' ? (
                <p className="rounded-md bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Venda cancelada. As receitas geradas por ela foram excluídas do Extrato.
                </p>
            ) : null}
        </div>
    );
}

export default function VendaModal({ open, onOpenChange, venda, formasPagamento, possuiConta, onCancelar }: Props) {
    const [contaFormOpen, setContaFormOpen] = useState(false);
    const [formaFormOpen, setFormaFormOpen] = useState(false);
    const { data, setData, post, put, processing, errors, clearErrors, transform } = useForm<VendaFormData>(rascunhoDaVenda(venda));
    const erros = errors as Partial<Record<string, string>>;
    const somenteLeitura = venda !== null && venda.status !== 'aberta';

    useEffect(() => {
        if (!open) {
            return;
        }

        setData(rascunhoDaVenda(venda));
        clearErrors();
    }, [open, venda?.id]);

    const linhas: VendaResumoLinha[] = data.itens.map((item) => {
        const quantidade = parseQuantidade(item.quantidade);

        return {
            chave: item.chave,
            nome: item.produto.nome,
            quantidade,
            valorTotal: emCentavos(quantidade * (item.valor_unitario ?? 0)) / 100,
        };
    });
    const totalCentavos = somaEmCentavos(linhas.map((linha) => linha.valorTotal));
    const total = totalCentavos / 100;
    const totalPagoCentavos = somaEmCentavos(data.pagamentos.map((pagamento) => pagamento.valor ?? 0));
    const unidades = linhas.reduce((soma, linha) => soma + linha.quantidade, 0);
    const fechaVenda = totalCentavos > 0 && totalPagoCentavos === totalCentavos;
    const precisaConta = Boolean(erros.conta) || (!possuiConta && fechaVenda);

    useEffect(() => {
        setData((atual) => {
            const [unico] = atual.pagamentos;
            if (atual.pagamentos.length !== 1 || !unico.acompanhaTotal || unico.valor === total) {
                return atual;
            }

            return { ...atual, pagamentos: [{ ...unico, valor: total > 0 ? total : null }] };
        });
    }, [total]);

    function submit(e: FormEvent): void {
        e.preventDefault();

        if (!possuiConta && fechaVenda) {
            setContaFormOpen(true);
            return;
        }

        transform((atual) => ({
            observacao: atual.observacao.trim() || null,
            itens: atual.itens.map((item) => ({
                produto_id: item.produto.id,
                quantidade: parseQuantidade(item.quantidade),
                valor_unitario: item.valor_unitario ?? 0,
            })),
            pagamentos: atual.pagamentos.map((pagamento) => ({
                forma_pagamento_id: pagamento.forma_pagamento_id,
                valor: pagamento.valor ?? 0,
            })),
        }));

        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (venda) {
            put(route('vendas.update', venda.id), options);
            return;
        }

        post(route('vendas.store'), options);
    }

    const titulo = venda ? `Venda #${venda.id}` : 'Nova Venda';
    const descricao = venda
        ? `${VENDA_STATUS_META[venda.status].label} • ${formatDataVenda(venda.data_venda)}`
        : 'Busque, adicione e finalize rápido';

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="h-[100vh] w-[100vw] overflow-hidden md:h-auto md:max-h-[90vh] md:w-[640px] md:max-w-full">
                    <DialogHeader>
                        <DialogTitle>{titulo}</DialogTitle>
                        <DialogDescription>{descricao}</DialogDescription>
                    </DialogHeader>

                    {somenteLeitura && venda ? (
                        <>
                            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
                                <VendaSomenteLeitura venda={venda} />
                            </div>
                            <DialogFooter className="flex flex-row gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" className="w-full">
                                        Voltar
                                    </Button>
                                </DialogClose>
                                {venda.status === 'fechada' ? (
                                    <Button type="button" variant="destructive" className="w-full" onClick={() => onCancelar(venda)}>
                                        Cancelar venda
                                    </Button>
                                ) : null}
                            </DialogFooter>
                        </>
                    ) : (
                        <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col gap-4">
                            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto pr-1">
                                <span className="text-muted-foreground text-xs">
                                    {data.itens.length} {data.itens.length === 1 ? 'item' : 'itens'} • {formatQuantidade(unidades)} unid.
                                </span>

                                <VendaItensEditor
                                    itens={data.itens}
                                    onChange={(itens) => setData('itens', itens)}
                                    errors={erros}
                                    disabled={processing}
                                />

                                <VendaResumo linhas={linhas} total={total} />

                                <VendaPagamentosEditor
                                    pagamentos={data.pagamentos}
                                    onChange={(pagamentos) => setData('pagamentos', pagamentos)}
                                    total={total}
                                    formasPagamento={formasPagamento}
                                    errors={erros}
                                    onCadastrarForma={() => setFormaFormOpen(true)}
                                />

                                {precisaConta ? (
                                    <div className="flex flex-col gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                                        <span>{erros.conta ?? 'Cadastre uma conta para fechar a venda: as receitas vão para a conta padrão.'}</span>
                                        <Button type="button" variant="secondary" size="sm" onClick={() => setContaFormOpen(true)}>
                                            Cadastrar conta
                                        </Button>
                                    </div>
                                ) : null}

                                <div className="grid gap-2">
                                    <Input
                                        aria-label="Observação"
                                        value={data.observacao}
                                        onChange={(e) => setData('observacao', e.target.value)}
                                        placeholder="Observação (opcional)"
                                        maxLength={1000}
                                        disabled={processing}
                                    />
                                    <InputError message={erros.observacao ?? erros.venda} />
                                </div>

                                {venda ? (
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 self-start text-sm font-medium text-red-600 hover:text-red-700"
                                        onClick={() => onCancelar(venda)}
                                    >
                                        <Ban className="h-4 w-4" />
                                        Cancelar venda
                                    </button>
                                ) : null}
                            </div>

                            <DialogFooter className="flex flex-row gap-2 border-t pt-4">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" className="w-full uppercase">
                                        Voltar
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full uppercase"
                                    loading={processing}
                                    disabled={data.itens.length === 0 || totalPagoCentavos > totalCentavos}
                                >
                                    Salvar venda
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <FormasPagamentoForm
                open={formaFormOpen}
                onOpenChange={setFormaFormOpen}
                forma={null}
                onCreated={(criada) => {
                    if (criada.ativo) {
                        setData((atual) => ({ ...atual, pagamentos: pagamentosComForma(atual.pagamentos, criada.id, total) }));
                    }
                }}
            />

            <ContasForm
                open={contaFormOpen}
                onOpenChange={setContaFormOpen}
                description="Cadastre a conta que vai receber as receitas desta venda."
                onCreated={() => clearErrors('conta' as keyof VendaFormData)}
            />
        </>
    );
}
