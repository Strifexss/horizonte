import { Button } from '@/components/ui/button';
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
import { router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import React, { useState } from 'react';

type Option = { id: number | string; nome: string };

type FiltersProps = {
    tipo_data?: string;
    data_inicio?: string;
    data_fim?: string;
    conta_id?: number;
    categoria_id?: number;
    status?: string;
};

function isoDate(date: Date): string {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function inicioMesISO(): string {
    const hoje = new Date();

    return isoDate(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
}

function fimMesISO(): string {
    const hoje = new Date();

    return isoDate(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0));
}

function queryNome(key: string): string {
    if (typeof window === 'undefined') {
        return '';
    }

    return new URLSearchParams(window.location.search).get(key) ?? '';
}

export default function ExtratoFilters() {
    const { props } = usePage();
    const filters = ((props as { filters?: FiltersProps }).filters ?? {}) as FiltersProps;
    const [tipoData, setTipoData] = useState(filters.tipo_data ?? 'vencimento');
    const [dataInicio, setDataInicio] = useState(filters.data_inicio ?? inicioMesISO());
    const [dataFim, setDataFim] = useState(filters.data_fim ?? fimMesISO());
    const [conta, setConta] = useState<Option | null>(
        filters.conta_id ? { id: filters.conta_id, nome: queryNome('conta_nome') || String(filters.conta_id) } : null,
    );
    const [categoria, setCategoria] = useState<Option | null>(
        filters.categoria_id
            ? { id: filters.categoria_id, nome: queryNome('categoria_nome') || String(filters.categoria_id) }
            : null,
    );
    const [status, setStatus] = useState(filters.status ?? 'todos');

    const loadContas = async (q: string) => {
        const res = await fetch(`/contas/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
            return [];
        }

        return res.json();
    };

    const loadCategorias = async (q: string) => {
        const res = await fetch(`/categorias/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
            return [];
        }

        return res.json();
    };

    const pesquisar = () => {
        const payload: Record<string, string | number> = {
            tipo_data: tipoData,
            data_inicio: dataInicio,
            data_fim: dataFim,
            status,
        };

        if (conta) {
            payload.conta_id = Number(conta.id);
            payload.conta_nome = conta.nome;
        }

        if (categoria) {
            payload.categoria_id = Number(categoria.id);
            payload.categoria_nome = categoria.nome;
        }

        router.get(route('extrato.index'), payload, { preserveScroll: true });
    };

    return (
        <div className="rounded-lg border border-sidebar-border/70 bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="grid min-w-0 items-end gap-3 md:grid-cols-8">
                <div className="flex flex-col gap-1">
                    <Label htmlFor="tipo-data">Tipo de data</Label>
                    <Select value={tipoData} onValueChange={setTipoData}>
                        <SelectTrigger id="tipo-data" className="w-full">
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
                            id="data-inicio"
                            type="date"
                            className="min-w-0 w-full"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                        />
                        <span className="hidden text-sm text-muted-foreground sm:inline">-</span>
                        <Input
                            id="data-fim"
                            type="date"
                            className="min-w-0 w-full"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1 md:col-span-1">
                    <Label>Conta</Label>
                    <AsyncSelect
                        value={conta}
                        onChange={setConta}
                        loadOptions={loadContas}
                        placeholder="Todos"
                        isClearable
                    />
                </div>

                <div className="flex flex-col gap-1 md:col-span-1">
                    <Label>Categoria</Label>
                    <AsyncSelect
                        value={categoria}
                        onChange={setCategoria}
                        loadOptions={loadCategorias}
                        placeholder="Todos"
                        isClearable
                    />
                </div>

                <div className="flex flex-col gap-1 md:col-span-1">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status" className="w-full">
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

                <div className="mt-3 flex justify-end md:col-span-8">
                    <Button
                        type="button"
                        variant="primary"
                        size="default"
                        className="inline-flex items-center gap-2"
                        onClick={pesquisar}
                    >
                        <Search />
                        Pesquisar
                    </Button>
                </div>
            </div>
        </div>
    );
}
