import type { ProdutoItem } from '@/components/produtos/types';

function formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));
}

/** Conteúdo do card do mobile; toque e ações ficam com o `MobileCardList`. */
export default function ProdutosCard({ item }: { item: ProdutoItem }) {
    return (
        <>
            <div className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.nome}</span>
                <span className="shrink-0 text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(item.preco_venda)}</span>
            </div>
            <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2">
                <span className="min-w-0 truncate text-xs text-slate-500">Compra {formatCurrency(item.preco_compra)}</span>
                <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        item.ativo ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-muted text-muted-foreground'
                    }`}
                >
                    {item.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </div>
        </>
    );
}
