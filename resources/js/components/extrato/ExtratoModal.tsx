import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';

type Option = { id: number | string; nome: string };

export type ExtratoModalMode = 'create' | 'edit';

export type ExtratoModalParcela = {
    id?: number | string | null;
    descricao?: string | null;
    data_vencimento?: string | null;
    valor?: number | string | null;
    valor_pago?: number | string | null;
    qtd_parcelas?: number | string | null;
    tipo?: string | null;
    categoria?: { id: number | string; nome: string } | null;
    categoria_id?: number | string | null;
    conta?: { id: number | string; nome: string } | null;
    conta_id?: number | string | null;
    financeiro?: {
        tipo?: string | null;
        categoria?: { id: number | string; nome: string } | null;
        conta?: { id: number | string; nome: string } | null;
    } | null;
};

function hojeISO(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function toInputValue(v: number | string | null | undefined): string {
    if (v === null || v === undefined) return '';
    return String(v);
}

export default function ExtratoModal({
    open,
    onOpenChange,
    mode = 'create',
    parcela = null,
}: {
    open: boolean;
    onOpenChange: (b: boolean) => void;
    mode?: ExtratoModalMode;
    parcela?: ExtratoModalParcela | null;
}) {
    const initialTipo: 'RECEITA' | 'DESPESA' =
        String(parcela?.tipo ?? parcela?.financeiro?.tipo ?? 'DESPESA').toUpperCase() === 'RECEITA'
            ? 'RECEITA'
            : 'DESPESA';

    const [activeTab, setActiveTab] = useState<'RECEITA' | 'DESPESA'>(initialTipo);
    const [selectedConta, setSelectedConta] = useState<Option | null>(null);
    const [selectedCategoria, setSelectedCategoria] = useState<Option | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        descricao: toInputValue(parcela?.descricao),
        data_vencimento: toInputValue(parcela?.data_vencimento) || hojeISO(),
        valor: toInputValue(parcela?.valor),
        valor_pago: toInputValue(parcela?.valor_pago),
        qtd_parcelas: Number(parcela?.qtd_parcelas ?? 1),
        tipo: initialTipo,
        categoria_id: (parcela?.categoria_id ?? parcela?.financeiro?.categoria?.id ?? null) as number | null,
        conta_id: (parcela?.conta_id ?? parcela?.financeiro?.conta?.id ?? null) as number | null,
    });

    useEffect(() => {
        setData('tipo', activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (!open) return;

        const isEdit = mode === 'edit' && parcela;
        const tipoFromParcela = String(parcela?.tipo ?? parcela?.financeiro?.tipo ?? 'DESPESA').toUpperCase();
        const initialTab: 'RECEITA' | 'DESPESA' = tipoFromParcela === 'RECEITA' ? 'RECEITA' : 'DESPESA';

        const contaId = (parcela?.conta_id ?? parcela?.conta?.id ?? null) as number | string | null;
        const categoriaId = (parcela?.categoria_id ?? parcela?.categoria?.id ?? null) as number | string | null;
        const contaNome = parcela?.conta?.nome ?? parcela?.conta?.nome ?? null;
        const categoriaNome = parcela?.categoria?.nome ?? parcela?.categoria?.nome ?? null;
        setActiveTab(initialTab);
        setSelectedConta(contaId ? { id: contaId, nome: contaNome ?? String(contaId) } : null);
        setSelectedCategoria(categoriaId ? { id: categoriaId, nome: categoriaNome ?? String(categoriaId) } : null);

        if (isEdit) {
            setData({
                descricao: toInputValue(parcela?.descricao),
                data_vencimento: toInputValue(parcela?.data_vencimento) || hojeISO(),
                valor: toInputValue(parcela?.valor),
                valor_pago: toInputValue(parcela?.valor_pago),
                qtd_parcelas: Number(parcela?.qtd_parcelas ?? 1),
                tipo: initialTab,
                categoria_id: categoriaId ? Number(categoriaId) : null,
                conta_id: contaId ? Number(contaId) : null,
            });
        } else {
            reset();
            clearErrors();
            setData('data_vencimento', hojeISO());
            setData('qtd_parcelas', 1);
        }
    }, [open, mode, parcela?.id]);

    const loadContas = async (q: string) => {
        const res = await fetch(`/contas/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        return res.json();
    };

    const loadCategorias = async (q: string) => {
        const res = await fetch(`/categorias/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        return res.json();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const isEdit = mode === 'edit' && parcela?.id;
        const url = isEdit ? route('extrato.update', { id: parcela.id }) : route('extrato.store');
        const submitMethod = isEdit ? put : post;

        submitMethod(url as any, {
            preserveState: true,
            preserveScroll: true,
            only: ['extratos', 'categoria'],
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:h-auto md:w-[700px] max-w-full overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{mode === 'edit' ? 'Editar lançamento' : 'Adicionar lançamento'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'edit'
                            ? 'Atualize os dados do lançamento de receita ou despesa.'
                            : 'Crie um novo lançamento de receita ou despesa.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col md:h-full">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className={`rounded-md px-3 py-1 ${activeTab === 'RECEITA' ? 'bg-primary text-primary-foreground' : 'bg-muted/5'}`}
                            onClick={() => setActiveTab('RECEITA')}
                        >
                            Receita
                        </button>
                        <button
                            type="button"
                            className={`rounded-md px-3 py-1 ${activeTab === 'DESPESA' ? 'bg-primary text-primary-foreground' : 'bg-muted/5'}`}
                            onClick={() => setActiveTab('DESPESA')}
                        >
                            Despesa
                        </button>
                    </div>

                    <div className="mt-4 rounded-lg border border-sidebar-border/70 bg-white dark:bg-slate-900 p-4 shadow-sm">
                        <form onSubmit={submit} className="grid gap-2">
                            <div className="grid md:grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="descricao">Descrição</Label>
                                    <Input
                                        id="descricao"
                                        value={data.descricao}
                                        onChange={(e) => setData('descricao', e.target.value)}
                                        placeholder="Descrição do lançamento"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.descricao} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="data_vencimento">Data de vencimento</Label>
                                    <Input
                                        id="data_vencimento"
                                        type="date"
                                        value={data.data_vencimento}
                                        onChange={(e) => setData('data_vencimento', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.data_vencimento} />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                    <Label>Conta</Label>
                                    <AsyncSelect
                                        value={selectedConta}
                                        onChange={(val) => {
                                            setSelectedConta(val);
                                            setData('conta_id', val ? Number(val.id) : null);
                                        }}
                                        loadOptions={loadContas}
                                        placeholder="Selecione a conta..."
                                        isClearable={false}
                                    />
                                    <InputError message={errors.conta_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Categoria</Label>
                                    <AsyncSelect
                                        value={selectedCategoria}
                                        onChange={(val) => {
                                            setSelectedCategoria(val);
                                            setData('categoria_id', val ? Number(val.id) : null);
                                        }}
                                        loadOptions={loadCategorias}
                                        placeholder="Selecione a categoria (opcional)"
                                        isClearable
                                    />
                                    <InputError message={errors.categoria_id} />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="valor">Valor</Label>
                                    <Input
                                        id="valor"
                                        value={data.valor}
                                        onChange={(e) => {
                                            const valor = e.target.value;
                                            setData({
                                                ...data,
                                                valor,
                                                valor_pago: valor,
                                            });
                                        }}
                                        placeholder="0.00"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.valor} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="valor_pago">Valor pago</Label>
                                    <Input
                                        id="valor_pago"
                                        value={data.valor_pago}
                                        onChange={(e) => setData('valor_pago', e.target.value)}
                                        placeholder="0.00"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.valor_pago} />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="qtd_parcelas">Quantidade de parcelas</Label>
                                    <Input
                                        id="qtd_parcelas"
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={data.qtd_parcelas}
                                        onChange={(e) => setData('qtd_parcelas', Number(e.target.value))}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.qtd_parcelas} />
                                </div>
                            </div>

                            <DialogFooter className='flex flex-row gap-2 mt-4'>
                                <DialogClose asChild>
                                    <Button className='w-full' variant="secondary" type="button" onClick={() => { reset(); }}>
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className="ml-2 w-full" loading={processing} variant="confirm">
                                    {mode === 'edit' ? 'Salvar alterações' : 'Adicionar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
