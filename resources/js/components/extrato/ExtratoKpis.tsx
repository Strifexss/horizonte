import { formatCurrency } from '@/components/extrato/format';
import type { ExtratoResumo } from '@/components/extrato/types';
import { KpisPanel, type KpiItem } from '@/components/padrões';
import { ArrowDownRight, ArrowUpRight, Grid } from 'lucide-react';

type ExtratoKpisProps = {
    resumo: ExtratoResumo | undefined;
    empilharNoMobile?: boolean;
};

export default function ExtratoKpis({ resumo, empilharNoMobile = false }: ExtratoKpisProps) {
    const totalCredits = Number(resumo?.total_credits ?? 0);
    const totalDebits = Number(resumo?.total_debits ?? 0);
    const saldoTotal = totalCredits - totalDebits;

    const items: KpiItem[] = [
        {
            id: 'in',
            label: 'Entradas',
            value: <span className="text-green-600">{formatCurrency(totalCredits)}</span>,
            hint: '',
            icon: <ArrowUpRight className="h-8 w-8 text-green-600" />,
        },
        {
            id: 'out',
            label: 'Saídas',
            value: <span className="text-red-600">{formatCurrency(totalDebits)}</span>,
            hint: '',
            icon: <ArrowDownRight className="h-8 w-8 text-red-600" />,
        },
        {
            id: 'total',
            label: 'Saldo Total',
            value: <span className={saldoTotal < 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(saldoTotal)}</span>,
            hint: saldoTotal < 0 ? 'Saldo negativo' : 'Saldo positivo',
            icon: <Grid className="text-muted-foreground h-8 w-8" />,
        },
    ];

    return <KpisPanel empilharNoMobile={empilharNoMobile} items={items} />;
}

export function ExtratoKpisSkeleton({ empilharNoMobile = false }: Pick<ExtratoKpisProps, 'empilharNoMobile'>) {
    const pulse = <span className="bg-muted inline-block h-5 w-24 animate-pulse rounded md:h-7 md:w-32" />;

    const items: KpiItem[] = [
        { id: 'in', label: 'Entradas', value: pulse },
        { id: 'out', label: 'Saídas', value: pulse },
        { id: 'total', label: 'Saldo Total', value: pulse },
    ];

    return <KpisPanel empilharNoMobile={empilharNoMobile} items={items} />;
}
