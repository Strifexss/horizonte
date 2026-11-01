import { formatCurrency } from '@/components/extrato/format';
import type { PeriodoResumo, ResumoInicio } from '@/components/inicio/types';
import { KpisPanel, type KpiItem } from '@/components/padrões';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, Grid } from 'lucide-react';
import { useState } from 'react';

const PERIODOS: { id: PeriodoResumo; label: string; saldo: string }[] = [
    { id: 'hoje', label: 'Hoje', saldo: 'Saldo do dia' },
    { id: 'mes', label: 'Este mês', saldo: 'Saldo do mês' },
];

export default function InicioResumo({ resumo }: { resumo?: ResumoInicio }) {
    const [periodo, setPeriodo] = useState<PeriodoResumo>('hoje');
    const totais = resumo?.[periodo];
    const rotuloSaldo = PERIODOS.find((p) => p.id === periodo)?.saldo ?? 'Saldo';
    const carregando = <span className="bg-muted inline-block h-5 w-24 animate-pulse rounded md:h-7 md:w-32" />;

    const items: KpiItem[] = [
        {
            id: 'receitas',
            label: 'Receitas',
            value: totais ? <span className="text-green-600">{formatCurrency(totais.receitas)}</span> : carregando,
            icon: <ArrowUpRight className="h-8 w-8 text-green-600" />,
        },
        {
            id: 'despesas',
            label: 'Despesas',
            value: totais ? <span className="text-red-600">{formatCurrency(totais.despesas)}</span> : carregando,
            icon: <ArrowDownRight className="h-8 w-8 text-red-600" />,
        },
        {
            id: 'saldo',
            label: rotuloSaldo,
            value: totais ? (
                <span className={cn(totais.saldo > 0 && 'text-green-600', totais.saldo < 0 && 'text-red-600')}>{formatCurrency(totais.saldo)}</span>
            ) : (
                carregando
            ),
            hint: 'Receitas menos despesas',
            icon: <Grid className="text-muted-foreground h-8 w-8" />,
        },
    ];

    return (
        <section aria-labelledby="inicio-resumo" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <h2 id="inicio-resumo" className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Resumo
                </h2>
                <div role="group" aria-label="Período do resumo" className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
                    {PERIODOS.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            aria-pressed={periodo === p.id}
                            onClick={() => setPeriodo(p.id)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                periodo === p.id
                                    ? 'text-foreground bg-white shadow-sm dark:bg-slate-900'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>
            <KpisPanel items={items} />
        </section>
    );
}
