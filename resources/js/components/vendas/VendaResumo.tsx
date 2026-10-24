import { formatCurrency, formatQuantidade } from '@/components/vendas/types';

export type VendaResumoLinha = {
    chave: string | number;
    nome: string;
    quantidade: number;
    valorTotal: number;
};

type Props = {
    linhas: VendaResumoLinha[];
    total: number;
};

export default function VendaResumo({ linhas, total }: Props) {
    return (
        <div className="flex flex-col gap-3">
            {linhas.length > 0 ? (
                <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                    <ul className="flex flex-col gap-2">
                        {linhas.map((linha) => (
                            <li key={linha.chave} className="flex min-w-0 items-center justify-between gap-2">
                                <span className="truncate text-slate-600 dark:text-slate-300">
                                    {linha.nome} × {formatQuantidade(linha.quantidade)}
                                </span>
                                <span className="shrink-0 font-semibold text-green-600">{formatCurrency(linha.valorTotal)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 font-semibold dark:border-slate-700">
                        <span>Subtotal</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            ) : null}

            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                <span className="text-xs font-bold tracking-wide text-slate-600 uppercase dark:text-slate-300">Total da venda</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{formatCurrency(total)}</span>
            </div>
        </div>
    );
}
