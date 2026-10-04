import type { ExtratoParcelaStatus } from '@/components/extrato/types';

export function formatDateISO(dateISO: string | null | undefined): string {
    if (!dateISO) {
        return '—';
    }

    try {
        const [year, month, day] = dateISO.split('-').map(Number);

        return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
    } catch {
        return dateISO;
    }
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function tipoDaParcela(p: { financeiro?: { tipo?: string | null } | null; tipo?: string | null }): string {
    return String(p.financeiro?.tipo ?? p.tipo ?? '').toUpperCase();
}

export function parcelaEhReceita(p: { financeiro?: { tipo?: string | null } | null; tipo?: string | null }): boolean {
    return tipoDaParcela(p) === 'RECEITA';
}

export function statusDaParcela(p: {
    valor?: number | string | null;
    valor_pago?: number | string | null;
}): ExtratoParcelaStatus {
    const valor = Number(p.valor ?? 0);
    const valorPago = Number(p.valor_pago ?? 0);

    if (!valorPago || valorPago === 0) {
        return 'aberto';
    }

    if (valorPago >= valor) {
        return 'pago';
    }

    return 'parcial';
}
