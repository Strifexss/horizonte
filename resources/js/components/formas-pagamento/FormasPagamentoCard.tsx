import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';

export function Selo({ children, tom }: { children: ReactNode; tom: 'ambar' | 'verde' | 'neutro' }) {
    const cores = {
        ambar: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        verde: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300',
        neutro: 'bg-muted text-muted-foreground',
    } as const;

    return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${cores[tom]}`}>{children}</span>;
}

/** Conteúdo do card do mobile; toque e ações ficam com o `MobileCardList`. */
export default function FormasPagamentoCard({ item }: { item: FormaPagamentoItem }) {
    return (
        <>
            <div className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.nome}</span>
                {item.padrao ? (
                    <span
                        className="text-muted-foreground inline-flex shrink-0 items-center gap-1 text-xs"
                        title="Formas padrão não podem ser alteradas"
                    >
                        <Lock className="h-3.5 w-3.5" />
                        Sistema
                    </span>
                ) : null}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Selo tom={item.padrao ? 'ambar' : 'neutro'}>{item.padrao ? 'Padrão' : 'Própria'}</Selo>
                <Selo tom={item.baixa_automatica ? 'verde' : 'neutro'}>{item.baixa_automatica ? 'Baixa automática' : 'Baixa manual'}</Selo>
                <Selo tom={item.ativo ? 'verde' : 'neutro'}>{item.ativo ? 'Ativa' : 'Inativa'}</Selo>
            </div>
        </>
    );
}
