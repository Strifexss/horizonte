import { ArrowDownRight, ArrowUpRight, BarChart2, Grid } from 'lucide-react';
import { KpisPanel } from '@/components/padrões';
import { formatCurrency } from '@/components/extrato/format';
import type { ExtratoResumo } from '@/components/extrato/types';

type ExtratoKpisProps = {
    resumo: ExtratoResumo | undefined;
};

export default function ExtratoKpis({ resumo }: ExtratoKpisProps) {
    const totalCredits = Number(resumo?.total_credits ?? 0);
    const totalDebits = Number(resumo?.total_debits ?? 0);
    const openingBalance = 0;
    const saldoTotal = openingBalance + totalCredits - totalDebits;

    return (
        <KpisPanel
            items={[
                {
                    id: 'prev',
                    label: 'Saldo Anterior',
                    value: formatCurrency(openingBalance),
                    hint: 'Antes do período',
                    icon: <BarChart2 className="h-8 w-8 text-muted-foreground" />,
                },
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
                    value: (
                        <span className={saldoTotal < 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(saldoTotal)}
                        </span>
                    ),
                    hint: saldoTotal < 0 ? 'Saldo negativo' : 'Saldo positivo',
                    icon: <Grid className="h-8 w-8 text-muted-foreground" />,
                },
            ]}
        />
    );
}
