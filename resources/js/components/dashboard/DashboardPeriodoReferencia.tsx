import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const NOMES_MES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];

type DashboardPeriodoReferenciaProps = {
    ano: number;
    mes: number;
    anos: number[];
    onPeriodoChange: (ano: number, mes: number) => void;
};

export default function DashboardPeriodoReferencia({ ano, mes, anos, onPeriodoChange }: DashboardPeriodoReferenciaProps) {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    const ehPeriodoAtual = ano === anoAtual && mes === mesAtual;

    return (
        <div className="border-sidebar-border/70 flex min-w-0 flex-col gap-3 rounded-xl border bg-white p-3 shadow-sm sm:flex-row sm:items-end dark:bg-slate-900">
            <div className="min-w-0 sm:mr-auto">
                <div className="text-sm font-medium">Período de referência</div>
                <div className="text-muted-foreground text-xs">Competência</div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end">
                <div className="flex min-w-0 flex-col gap-1">
                    <Label htmlFor="periodo-ano" className="text-xs">
                        Ano
                    </Label>
                    <Select value={String(ano)} onValueChange={(valor) => onPeriodoChange(Number(valor), mes)}>
                        <SelectTrigger id="periodo-ano" className="h-9 w-full sm:w-[7rem]">
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                            {anos.map((opcao) => (
                                <SelectItem key={opcao} value={String(opcao)}>
                                    {opcao}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex min-w-0 flex-col gap-1">
                    <Label htmlFor="periodo-mes" className="text-xs">
                        Mês
                    </Label>
                    <Select value={String(mes)} onValueChange={(valor) => onPeriodoChange(ano, Number(valor))}>
                        <SelectTrigger id="periodo-mes" className="h-9 w-full sm:w-[9.5rem]">
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                            {NOMES_MES.map((nome, indice) => (
                                <SelectItem key={nome} value={String(indice + 1)}>
                                    {nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="col-span-2 h-9"
                    disabled={ehPeriodoAtual}
                    onClick={() => onPeriodoChange(anoAtual, mesAtual)}
                >
                    Período atual
                </Button>
            </div>
        </div>
    );
}
