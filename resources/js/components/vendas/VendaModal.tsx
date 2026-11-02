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
    type ProdutoParaVenda,
    type Venda,
    type VendaItemRascunho,
    type VendaNamed,
    type VendaPagamentoRascunho,
} from '@/components/vendas/types';
import VendaCatalogoMobile from '@/components/vendas/VendaCatalogoMobile';
import VendaClienteCampo from '@/components/vendas/VendaClienteCampo';
import VendaCorrecaoModal, { pendenciasDaVenda, temPendencias, type CorrecaoDaVenda } from '@/components/vendas/VendaCorrecaoModal';
import VendaItensEditor from '@/components/vendas/VendaItensEditor';
import VendaPagamentosEditor, { pagamentosComForma } from '@/components/vendas/VendaPagamentosEditor';
import VendaResumo, { type VendaResumoLinha } from '@/components/vendas/VendaResumo';
import { useIsMobile } from '@/hooks/use-mobile';
import { useForm } from '@inertiajs/react';
import { Ban, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

type VendaFormData = {
    cliente: VendaNamed;
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
    favoritos?: ProdutoParaVenda[];
    clientePadrao: VendaNamed;
    grupos?: VendaNamed[];
};

function rascunhoDaVenda(venda: Venda | null, clientePadrao: VendaNamed): VendaFormData {
    if (!venda) {
        return { cliente: clientePadrao, itens: [], pagamentos: [], observacao: '' };
    }

    return {
        cliente: venda.cliente ?? clientePadrao,
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
            <div className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm">
                <span className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-200">Cliente</span>
                <span className="font-medium">{venda.cliente?.nome ?? '—'}</span>
            </div>
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

export default function VendaModal({
    open,
    onOpenChange,
    venda,
    formasPagamento,
    possuiConta,
    onCancelar,
    favoritos = [],
    clientePadrao,
    grupos = [],
}: Props) {
    const [contaFormOpen, setContaFormOpen] = useState(false);
    const [formaFormOpen, setFormaFormOpen] = useState(false);
    const [etapa, setEtapa] = useState<1 | 2>(1);
    const [correcaoOpen, setCorrecaoOpen] = useState(false);
    const [enviarAposCorrecao, setEnviarAposCorrecao] = useState(false);
    const precosParaCadastro = useRef<number[]>([]);
    const [itensAbertos, setItensAbertos] = useState(false);
    const isMobile = useIsMobile();
    const { data, setData, post, put, processing, errors, clearErrors, transform } = useForm<VendaFormData>(rascunhoDaVenda(venda, clientePadrao));
    const erros = errors as Partial<Record<string, string>>;
    const somenteLeitura = venda !== null && venda.status !== 'aberta';

    useEffect(() => {
        if (!open) {
            return;
        }

        setData(rascunhoDaVenda(venda, clientePadrao));
        clearErrors();
        setEtapa(1);
        setItensAbertos(false);
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

    function enviar(): void {
        transform((atual) => ({
            cliente_id: atual.cliente.id,
            observacao: atual.observacao.trim() || null,
            atualizar_preco_produto_ids: precosParaCadastro.current,
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
            onError: (errosDoServidor: Partial<Record<string, string>>) => {
                if (temPendencias(pendenciasDaVenda(data.itens, data.pagamentos, errosDoServidor))) {
                    setCorrecaoOpen(true);
                }
            },
            onFinish: () => {
                precosParaCadastro.current = [];
            },
        };

        if (venda) {
            put(route('vendas.update', venda.id), options);
            return;
        }

        post(route('vendas.store'), options);
    }

    function submit(e: FormEvent): void {
        e.preventDefault();

        if (!possuiConta && fechaVenda) {
            setContaFormOpen(true);
            return;
        }

        if (temPendencias(pendenciasDaVenda(data.itens, data.pagamentos, {}))) {
            setCorrecaoOpen(true);
            return;
        }

        enviar();
    }

    function aplicarCorrecao(correcao: CorrecaoDaVenda): void {
        precosParaCadastro.current = correcao.atualizarPrecoProdutoIds;
        setData((atual) => ({ ...atual, itens: correcao.itens, pagamentos: correcao.pagamentos }));
        setCorrecaoOpen(false);
        setEnviarAposCorrecao(true);
    }

    useEffect(() => {
        if (enviarAposCorrecao) {
            setEnviarAposCorrecao(false);
            enviar();
        }
        // Envia depois que o `setData` da correção já refletiu no formulário.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enviarAposCorrecao, data]);

    const podeSalvar = !processing && data.itens.length > 0 && totalPagoCentavos <= totalCentavos;

    /** Enter fora de campos de texto (ex.: após clicar numa forma de pagamento) salva a venda. */
    function salvarComEnter(e: KeyboardEvent<HTMLFormElement>): void {
        const alvo = e.target as HTMLElement;
        if (e.key !== 'Enter' || (isMobile && etapa === 1) || alvo.closest('input, textarea, select, button, [role="combobox"]') || !podeSalvar) {
            return;
        }

        e.preventDefault();
        e.currentTarget.requestSubmit();
    }

    const titulo = venda ? `Venda #${venda.id}` : 'Nova Venda';
    const descricaoBase = venda
        ? `${VENDA_STATUS_META[venda.status].label} • ${formatDataVenda(venda.data_venda)}`
        : 'Busque, adicione e finalize rápido';
    const descricao = isMobile && !somenteLeitura ? (etapa === 1 ? 'Etapa 1 de 2 · Produtos' : 'Etapa 2 de 2 · Pagamento') : descricaoBase;
    const resumoQuantidade = `${data.itens.length} ${data.itens.length === 1 ? 'item' : 'itens'} • ${formatQuantidade(unidades)} unid.`;
    const botaoSalvarDesabilitado = data.itens.length === 0 || totalPagoCentavos > totalCentavos;

    const campoCliente = (
        <VendaClienteCampo
            cliente={data.cliente}
            onChange={(cliente) => setData('cliente', cliente)}
            clientePadrao={clientePadrao}
            error={erros.cliente_id}
            disabled={processing}
        />
    );

    const campoPagamentos = (
        <VendaPagamentosEditor
            pagamentos={data.pagamentos}
            onChange={(pagamentos) => setData('pagamentos', pagamentos)}
            total={total}
            formasPagamento={formasPagamento}
            errors={erros}
            compacto
            onCadastrarForma={() => setFormaFormOpen(true)}
        />
    );

    const avisoConta = precisaConta ? (
        <div className="flex flex-col gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <span>{erros.conta ?? 'Cadastre uma conta para fechar a venda: as receitas vão para a conta padrão.'}</span>
            <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => setContaFormOpen(true)}>
                Cadastrar conta
            </Button>
        </div>
    ) : null;

    const campoObservacao = (
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
    );

    const linkCancelar = venda ? (
        <button
            type="button"
            className="inline-flex items-center gap-1 self-start text-sm font-medium text-red-600 hover:text-red-700"
            onClick={() => onCancelar(venda)}
        >
            <Ban className="h-4 w-4" />
            Cancelar venda
        </button>
    ) : null;

    const botaoSalvar = (
        <Button type="submit" variant="primary" className="w-full justify-center uppercase" loading={processing} disabled={botaoSalvarDesabilitado}>
            Salvar venda
        </Button>
    );

    const conteudoDesktop = (
        <div className="-mx-6 -mb-6 flex min-h-0 flex-1 border-t">
            <section aria-label="Montar a venda" className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
                <VendaItensEditor
                    itens={data.itens}
                    onChange={(itens) => setData('itens', itens)}
                    errors={erros}
                    disabled={processing}
                    favoritos={favoritos}
                />
                {data.itens.length === 0 ? (
                    <p className="border-sidebar-border/70 text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                        Bipe um código, busque ou clique num favorito.
                    </p>
                ) : null}
            </section>

            <aside aria-label="Fechar a venda" className="flex w-[340px] shrink-0 flex-col border-l bg-slate-50 dark:bg-slate-900/60">
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
                    {campoCliente}
                    <div className="bg-background flex flex-col gap-1 rounded-lg border px-4 py-3">
                        <span className="text-xs font-bold tracking-wide text-slate-600 uppercase dark:text-slate-300">Total da venda</span>
                        <span className="text-3xl font-bold">{formatCurrency(total)}</span>
                        <span className="text-muted-foreground text-xs">{resumoQuantidade}</span>
                    </div>
                    {campoPagamentos}
                    {avisoConta}
                    {campoObservacao}
                    {linkCancelar}
                </div>
                <div className="flex flex-col gap-2 border-t p-5">
                    {botaoSalvar}
                    <DialogClose asChild>
                        <Button type="button" variant="ghost" className="w-full">
                            Voltar <span className="text-muted-foreground text-xs">(Esc)</span>
                        </Button>
                    </DialogClose>
                </div>
            </aside>
        </div>
    );

    const conteudoMobile =
        etapa === 1 ? (
            <>
                <VendaCatalogoMobile itens={data.itens} onChange={(itens) => setData('itens', itens)} grupos={grupos} disabled={processing} />
                <InputError message={erros.itens} />
                <DialogFooter className="flex flex-row gap-2 border-t pt-3">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="h-12 w-28 shrink-0">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        variant="primary"
                        className="h-12 flex-1 justify-between"
                        disabled={data.itens.length === 0}
                        onClick={() => setEtapa(2)}
                    >
                        <span>Avançar</span>
                        <span className="text-sm font-medium">
                            {data.itens.length > 0 ? `${formatQuantidade(unidades)} ${unidades === 1 ? 'item' : 'itens'} · ` : ''}
                            {formatCurrency(total)}
                        </span>
                    </Button>
                </DialogFooter>
            </>
        ) : (
            <>
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
                    {campoCliente}
                    <div className="rounded-lg border">
                        <div className="flex items-center gap-2 py-1.5 pr-1.5 pl-3">
                            <button
                                type="button"
                                aria-expanded={itensAbertos}
                                onClick={() => setItensAbertos((aberto) => !aberto)}
                                className="flex h-10 flex-1 items-center gap-1.5 text-left text-sm font-semibold"
                            >
                                <ChevronRight className={`text-muted-foreground h-4 w-4 transition-transform ${itensAbertos ? 'rotate-90' : ''}`} />
                                Itens da venda ({data.itens.length})
                            </button>
                            <Button type="button" variant="outline" size="sm" className="border-blue-600 text-blue-700" onClick={() => setEtapa(1)}>
                                + Adicionar itens
                            </Button>
                        </div>
                        {itensAbertos ? (
                            <ul className="border-t px-3 py-1">
                                {linhas.map((linha) => (
                                    <li key={linha.chave} className="flex justify-between gap-2 py-1.5 text-sm">
                                        <span className="truncate text-slate-600 dark:text-slate-300">
                                            {linha.nome} × {formatQuantidade(linha.quantidade)}
                                        </span>
                                        <span className="shrink-0 font-semibold text-green-600">{formatCurrency(linha.valorTotal)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                    <VendaResumo linhas={[]} total={total} />
                    {campoPagamentos}
                    {avisoConta}
                    {campoObservacao}
                    {linkCancelar}
                </div>
                <DialogFooter className="flex flex-row gap-2 border-t pt-3">
                    <Button type="button" variant="secondary" className="h-12 w-28 shrink-0" onClick={() => setEtapa(1)}>
                        Voltar
                    </Button>
                    <div className="flex-1 [&>button]:h-12">{botaoSalvar}</div>
                </DialogFooter>
            </>
        );

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className={`h-[100vh] w-[100vw] overflow-hidden md:max-w-full ${
                        somenteLeitura ? 'md:h-auto md:max-h-[90vh] md:w-[640px]' : 'md:h-[88vh] md:w-[1040px]'
                    }`}
                >
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
                        <form onSubmit={submit} onKeyDown={salvarComEnter} noValidate className="flex min-h-0 flex-1 flex-col gap-3">
                            {isMobile ? conteudoMobile : conteudoDesktop}
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <VendaCorrecaoModal
                open={correcaoOpen}
                onOpenChange={setCorrecaoOpen}
                itens={data.itens}
                pagamentos={data.pagamentos}
                formasPagamento={formasPagamento}
                errors={erros}
                resumo={`${data.cliente.nome} · ${resumoQuantidade} · ${formatCurrency(total)}`}
                onConfirmar={aplicarCorrecao}
            />

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
