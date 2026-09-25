import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AsyncSelect from '@/components/ui/AsyncSelect';
import React from 'react';

export type FilterOption = { id: number | string; nome: string };

export type ExtratoFilterValues = {
    tipoData: string;
    dataInicio: string;
    dataFim: string;
    conta: FilterOption | null;
    categoria: FilterOption | null;
    status: string;
};

type Props = {
    values: ExtratoFilterValues;
    onChange: (patch: Partial<ExtratoFilterValues>) => void;
    loadContas: (q: string) => Promise<FilterOption[]>;
    loadCategorias: (q: string) => Promise<FilterOption[]>;
    idPrefix?: string;
};

export default function ExtratoFilterFields({
    values,
    onChange,
    loadContas,
    loadCategorias,
    idPrefix = '',
}: Props) {
    return (
        <div className="grid min-w-0 items-end gap-3 md:grid-cols-8">
            <div className="flex flex-col gap-1">
                <Label htmlFor={`${idPrefix}tipo-data`}>Tipo de data</Label>
                <Select value={values.tipoData} onValueChange={(tipoData) => onChange({ tipoData })}>
                    <SelectTrigger id={`${idPrefix}tipo-data`} className="w-full">
                        <SelectValue placeholder="Tipo de data" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vencimento">Vencimento</SelectItem>
                        <SelectItem value="competencia">Competência</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex min-w-0 flex-col gap-1 md:col-span-3">
                <Label>Período</Label>
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                        id={`${idPrefix}data-inicio`}
                        type="date"
                        className="min-w-0 w-full"
                        value={values.dataInicio}
                        onChange={(e) => onChange({ dataInicio: e.target.value })}
                    />
                    <span className="hidden text-sm text-muted-foreground sm:inline">-</span>
                    <Input
                        id={`${idPrefix}data-fim`}
                        type="date"
                        className="min-w-0 w-full"
                        value={values.dataFim}
                        onChange={(e) => onChange({ dataFim: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1 md:col-span-1">
                <Label>Conta</Label>
                <AsyncSelect
                    value={values.conta}
                    onChange={(conta) => onChange({ conta })}
                    loadOptions={loadContas}
                    placeholder="Todos"
                    isClearable
                />
            </div>

            <div className="flex flex-col gap-1 md:col-span-1">
                <Label>Categoria</Label>
                <AsyncSelect
                    value={values.categoria}
                    onChange={(categoria) => onChange({ categoria })}
                    loadOptions={loadCategorias}
                    placeholder="Todos"
                    isClearable
                />
            </div>

            <div className="flex flex-col gap-1 md:col-span-1">
                <Label htmlFor={`${idPrefix}status`}>Status</Label>
                <Select value={values.status} onValueChange={(status) => onChange({ status })}>
                    <SelectTrigger id={`${idPrefix}status`} className="w-full">
                        <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="parcial">Parcial</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
