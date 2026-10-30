import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import InputError from '@/components/input-error';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MoneyInput from '@/components/ui/money-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { emCentavos, formatCurrency, novaChave, type VendaPagamentoRascunho } from '@/components/vendas/types';
import { Banknote, CreditCard, Plus, QrCode, Settings, Wallet, X, type LucideIcon } from 'lucide-react';

const ICONES_PADRAO: Record<string, LucideIcon> = {
    Espécie: Banknote,
    Pix: QrCode,
    'Cartão de Crédito': CreditCard,
    'Cartão de Débito': CreditCard,
};

type Props = {
    pagamentos: VendaPagamentoRascunho[];
    onChange: (pagamentos: VendaPagamentoRascunho[]) => void;
    total: number;
    formasPagamento: FormaPagamentoItem[];
    errors: Partial<Record<string, string>>;
    onCadastrarForma: () => void;
};

function erroDaLinha(errors: Props['errors'], index: number): string | undefined {
    return errors[`pagamentos.${index}.forma_pagamento_id`] ?? errors[`pagamentos.${index}.valor`];
}

function restanteEmCentavos(pagamentos: VendaPagamentoRascunho[], total: number): number {
    const totalPago = pagamentos.reduce((soma, pagamento) => soma + (pagamento.valor ?? 0), 0);

    return emCentavos(total) - emCentavos(totalPago);
}

function novoPagamento(formaId: number, restanteCentavos: number, acompanhaTotal: boolean): VendaPagamentoRascunho {
    return {
        chave: novaChave(),
        forma_pagamento_id: formaId,
        valor: restanteCentavos > 0 ? restanteCentavos / 100 : null,
        acompanhaTotal,
    };
}

/** Primeira forma leva o total; com saldo restante, vira mais uma linha; com tudo pago e linha única, troca a forma. */
export function pagamentosComForma(pagamentos: VendaPagamentoRascunho[], formaId: number, total: number): VendaPagamentoRascunho[] {
    const restanteCentavos = restanteEmCentavos(pagamentos, total);

    if (pagamentos.length === 0) {
        return [novoPagamento(formaId, restanteCentavos, true)];
    }

    if (restanteCentavos > 0) {
        return [...pagamentos.map((pagamento) => ({ ...pagamento, acompanhaTotal: false })), novoPagamento(formaId, restanteCentavos, false)];
    }

    if (pagamentos.length === 1) {
        return [{ ...pagamentos[0], forma_pagamento_id: formaId }];
    }

    return pagamentos;
}

export default function VendaPagamentosEditor({ pagamentos, onChange, total, formasPagamento, errors, onCadastrarForma }: Props) {
    const usadas = new Set(pagamentos.map((pagamento) => pagamento.forma_pagamento_id));
    const formasAtivas = formasPagamento.filter((forma) => forma.ativo || usadas.has(forma.id));
    const padroes = formasAtivas.filter((forma) => forma.padrao);
    const proprias = formasAtivas.filter((forma) => !forma.padrao);

    const restanteCentavos = restanteEmCentavos(pagamentos, total);
    const restante = restanteCentavos / 100;

    function escolherForma(forma: FormaPagamentoItem): void {
        onChange(pagamentosComForma(pagamentos, forma.id, total));
    }

    function dividirPagamento(): void {
        const forma = formasAtivas.find((item) => !usadas.has(item.id)) ?? formasAtivas[0];
        if (!forma) {
            return;
        }

        onChange([...pagamentos.map((pagamento) => ({ ...pagamento, acompanhaTotal: false })), novoPagamento(forma.id, restanteCentavos, false)]);
    }

    function atualizar(chave: string, patch: Partial<VendaPagamentoRascunho>): void {
        onChange(pagamentos.map((pagamento) => (pagamento.chave === chave ? { ...pagamento, ...patch } : pagamento)));
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-200">Forma de pagamento</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800">
                            <Settings className="h-3.5 w-3.5" />
                            Mais
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {proprias.length === 0 ? (
                            <DropdownMenuItem disabled>Nenhuma forma própria ativa</DropdownMenuItem>
                        ) : (
                            proprias.map((forma) => (
                                <DropdownMenuItem key={forma.id} onSelect={() => escolherForma(forma)}>
                                    <Wallet className="mr-2 h-4 w-4" />
                                    {forma.nome}
                                </DropdownMenuItem>
                            ))
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={onCadastrarForma}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova forma de pagamento
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {padroes.map((forma) => {
                    const Icone = ICONES_PADRAO[forma.nome] ?? Wallet;
                    const selecionada = usadas.has(forma.id);

                    return (
                        <button
                            key={forma.id}
                            type="button"
                            aria-pressed={selecionada}
                            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border-2 px-2 py-3 text-sm transition-colors ${
                                selecionada
                                    ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                            }`}
                            onClick={() => escolherForma(forma)}
                        >
                            <Icone className="h-5 w-5" />
                            <span className="w-full truncate text-center">{forma.nome}</span>
                        </button>
                    );
                })}
            </div>

            {pagamentos.map((pagamento, index) => (
                <div key={pagamento.chave}>
                    <div className="flex min-w-0 items-center gap-2">
                        <Select
                            value={String(pagamento.forma_pagamento_id)}
                            onValueChange={(value) => atualizar(pagamento.chave, { forma_pagamento_id: Number(value) })}
                        >
                            <SelectTrigger aria-label="Forma do pagamento" className="min-w-0 flex-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {formasAtivas.map((forma) => (
                                    <SelectItem key={forma.id} value={String(forma.id)}>
                                        {forma.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <MoneyInput
                            aria-label="Valor do pagamento"
                            className="w-32 shrink-0"
                            showSymbol
                            value={pagamento.valor}
                            onValueChange={(valor) => atualizar(pagamento.chave, { valor, acompanhaTotal: false })}
                            placeholder="R$ 0,00"
                        />
                        <button
                            type="button"
                            aria-label="Remover pagamento"
                            className="text-muted-foreground hover:bg-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                            onClick={() => onChange(pagamentos.filter((item) => item.chave !== pagamento.chave))}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <InputError message={erroDaLinha(errors, index)} className="mt-1" />
                </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <button
                    type="button"
                    className="font-semibold text-blue-700 hover:text-blue-800 disabled:opacity-40"
                    disabled={pagamentos.length === 0}
                    onClick={dividirPagamento}
                >
                    + Dividir pagamento
                </button>
                {restanteCentavos > 0 ? (
                    <span className="font-medium text-amber-700 dark:text-amber-300">Falta pagar {formatCurrency(restante)}</span>
                ) : restanteCentavos < 0 ? (
                    <span className="font-medium text-red-600">Pagamentos passam do total em {formatCurrency(-restante)}</span>
                ) : pagamentos.length > 0 ? (
                    <span className="font-medium text-green-600">Pagamento completo</span>
                ) : null}
            </div>
            <InputError message={errors.pagamentos} />
        </div>
    );
}
