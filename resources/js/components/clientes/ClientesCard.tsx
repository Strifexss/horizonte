import type { ClienteItem } from '@/components/clientes/types';

/** Conteúdo do card do mobile; toque e ações ficam com o `MobileCardList`. */
export default function ClientesCard({ item }: { item: ClienteItem }) {
    return (
        <>
            <div className="flex min-w-0 items-start justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <span className="truncate">{item.nome}</span>
                    {item.padrao ? (
                        <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium">Padrão</span>
                    ) : null}
                </span>
                <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        item.ativo ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-muted text-muted-foreground'
                    }`}
                >
                    {item.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </div>
            <div className="mt-1.5 truncate text-xs text-slate-500">{[item.telefone, item.documento].filter(Boolean).join(' • ') || '—'}</div>
        </>
    );
}
