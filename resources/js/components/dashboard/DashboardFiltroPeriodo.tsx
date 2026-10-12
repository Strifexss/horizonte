import FiltroPeriodoDatas from '@/components/padrões/FiltroPeriodoDatas';
import { Button } from '@/components/ui/button';

type DashboardFiltroPeriodoProps = {
    dataInicio: string;
    dataFim: string;
    onPeriodoChange: (inicio: string, fim: string) => void;
    idPrefix?: string;
};

function isoLocal(data: Date): string {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

function mesVigente(): { inicio: string; fim: string } {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    return { inicio: isoLocal(inicio), fim: isoLocal(fim) };
}

function periodoValido(inicio: string, fim: string): boolean {
    return inicio !== '' && fim !== '' && inicio <= fim;
}

export default function DashboardFiltroPeriodo({
    dataInicio,
    dataFim,
    onPeriodoChange,
    idPrefix = '',
}: DashboardFiltroPeriodoProps) {
    function aoInicio(valor: string): void {
        if (periodoValido(valor, dataFim)) {
            onPeriodoChange(valor, dataFim);
        }
    }

    function aoFim(valor: string): void {
        if (periodoValido(dataInicio, valor)) {
            onPeriodoChange(dataInicio, valor);
        }
    }

    function aoMesVigente(): void {
        const { inicio, fim } = mesVigente();
        onPeriodoChange(inicio, fim);
    }

    return (
        <div className="flex min-w-0 flex-col gap-2">
            <FiltroPeriodoDatas
                dataInicio={dataInicio}
                dataFim={dataFim}
                onInicioChange={aoInicio}
                onFimChange={aoFim}
                idPrefix={idPrefix}
                mostrarRotulo={false}
            />
            <Button type="button" variant="ghost" size="sm" className="h-8 w-full text-xs" onClick={aoMesVigente}>
                Mês vigente
            </Button>
        </div>
    );
}
