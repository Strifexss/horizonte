import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';

type DashboardFiltroPeriodoProps = {
    dataInicio: string;
    dataFim: string;
    onPeriodoChange: (inicio: string, fim: string) => void;
};

function parseIsoLocal(iso: string): Date {
    const [ano, mes, dia] = iso.split('-').map(Number);

    return new Date(ano, (mes ?? 1) - 1, dia ?? 1);
}

function isoLocal(data: Date): string {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

function formatarData(iso: string): string {
    const [ano, mes, dia] = iso.split('-');

    if (!ano || !mes || !dia) {
        return iso;
    }

    return `${dia}/${mes}/${ano}`;
}

function mesVigente(): { inicio: string; fim: string } {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    return { inicio: isoLocal(inicio), fim: isoLocal(fim) };
}

export default function DashboardFiltroPeriodo({ dataInicio, dataFim, onPeriodoChange }: DashboardFiltroPeriodoProps) {
    const [aberto, setAberto] = useState(false);
    const [rascunho, setRascunho] = useState<DateRange | undefined>();

    const selecionado = useMemo<DateRange>(
        () => ({
            from: parseIsoLocal(dataInicio),
            to: parseIsoLocal(dataFim),
        }),
        [dataFim, dataInicio],
    );

    const visivel = rascunho ?? selecionado;

    function aplicar(inicio: string, fim: string): void {
        setRascunho(undefined);
        setAberto(false);
        onPeriodoChange(inicio, fim);
    }

    function aoSelecionar(proximo: DateRange | undefined): void {
        setRascunho(proximo);

        if (proximo?.from && proximo.to) {
            aplicar(isoLocal(proximo.from), isoLocal(proximo.to));
        }
    }

    function aoMesVigente(): void {
        const { inicio, fim } = mesVigente();
        aplicar(inicio, fim);
    }

    return (
        <Popover
            open={aberto}
            onOpenChange={(proximo) => {
                setAberto(proximo);
                if (!proximo) {
                    setRascunho(undefined);
                }
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto min-h-8 w-full min-w-0 justify-start gap-1.5 px-2 py-1.5 text-xs font-normal whitespace-normal"
                    aria-label="Período de competência"
                    aria-expanded={aberto}
                >
                    <CalendarDays className="size-3.5 shrink-0" />
                    <span className="text-left leading-snug">
                        {formatarData(dataInicio)} – {formatarData(dataFim)}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-2" side="bottom">
                <Calendar
                    mode="range"
                    selected={visivel}
                    onSelect={aoSelecionar}
                    defaultMonth={visivel.from}
                    numberOfMonths={1}
                />
                <div className="border-t px-2 py-2">
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-full text-xs" onClick={aoMesVigente}>
                        Mês vigente
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
