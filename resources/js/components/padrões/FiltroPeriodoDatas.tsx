import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FiltroPeriodoDatasProps = {
    dataInicio: string;
    dataFim: string;
    onInicioChange: (valor: string) => void;
    onFimChange: (valor: string) => void;
    idPrefix?: string;
    mostrarRotulo?: boolean;
};

export default function FiltroPeriodoDatas({
    dataInicio,
    dataFim,
    onInicioChange,
    onFimChange,
    idPrefix = '',
    mostrarRotulo = true,
}: FiltroPeriodoDatasProps) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            {mostrarRotulo ? <Label>Período</Label> : null}
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                    id={`${idPrefix}data-inicio`}
                    type="date"
                    className="min-w-0 w-full"
                    value={dataInicio}
                    onChange={(evento) => onInicioChange(evento.target.value)}
                />
                <span className="hidden text-sm text-muted-foreground sm:inline">-</span>
                <Input
                    id={`${idPrefix}data-fim`}
                    type="date"
                    className="min-w-0 w-full"
                    value={dataFim}
                    onChange={(evento) => onFimChange(evento.target.value)}
                />
            </div>
        </div>
    );
}
