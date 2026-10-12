import FiltroPeriodoDatas from '@/components/padrões/FiltroPeriodoDatas';
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
    produto: FilterOption | null;
    grupo: FilterOption | null;
    fornecedor: FilterOption | null;
    status: string;
};

type Props = {
    values: ExtratoFilterValues;
    onChange: (patch: Partial<ExtratoFilterValues>) => void;
    loadContas: (q: string) => Promise<FilterOption[]>;
    loadCategorias: (q: string) => Promise<FilterOption[]>;
    loadProdutos: (q: string) => Promise<FilterOption[]>;
    loadGrupos: (q: string) => Promise<FilterOption[]>;
    loadFornecedores: (q: string) => Promise<FilterOption[]>;
    idPrefix?: string;
};

export default function ExtratoFilterFields({
    values,
    onChange,
    loadContas,
    loadCategorias,
    loadProdutos,
    loadGrupos,
    loadFornecedores,
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
                        <SelectItem value="competencia">Competência</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="min-w-0 md:col-span-2">
                <FiltroPeriodoDatas
                    dataInicio={values.dataInicio}
                    dataFim={values.dataFim}
                    onInicioChange={(dataInicio) => onChange({ dataInicio })}
                    onFimChange={(dataFim) => onChange({ dataFim })}
                    idPrefix={idPrefix}
                />
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
                <Label>Produto</Label>
                <AsyncSelect
                    value={values.produto}
                    onChange={(produto) => onChange({ produto })}
                    loadOptions={loadProdutos}
                    placeholder="Todos"
                    isClearable
                />
            </div>

            <div className="flex flex-col gap-1 md:col-span-1">
                <Label>Grupo</Label>
                <AsyncSelect
                    value={values.grupo}
                    onChange={(grupo) => onChange({ grupo })}
                    loadOptions={loadGrupos}
                    placeholder="Todos"
                    isClearable
                />
            </div>

            <div className="flex flex-col gap-1 md:col-span-1">
                <Label>Fornecedor</Label>
                <AsyncSelect
                    value={values.fornecedor}
                    onChange={(fornecedor) => onChange({ fornecedor })}
                    loadOptions={loadFornecedores}
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
