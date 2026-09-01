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

function hojeISO(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

export default function ExtratoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
    const [activeTab, setActiveTab] = useState<'RECEITA' | 'DESPESA'>('DESPESA');
    const [selectedConta, setSelectedConta] = useState<Option | null>(null);
    const [selectedCategoria, setSelectedCategoria] = useState<Option | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        descricao: '',
        data_vencimento: hojeISO(),
        valor: '',
        valor_pago: '',
        qtd_parcelas: 1,
        tipo: activeTab,
        categoria_id: null as number | null,
        conta_id: null as number | null,
    });

    useEffect(() => {
        setData('tipo', activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (!open) return;
        reset();
        clearErrors();
        setSelectedCategoria(null);
        setSelectedConta(null);
        setData('data_vencimento', hojeISO());
        setData('qtd_parcelas', 1);
    }, [open]);

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
        post(route('extrato.store'), {
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
                    <DialogTitle>Adicionar lançamento</DialogTitle>
                    <DialogDescription>Crie um novo lançamento de receita ou despesa.</DialogDescription>
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
                                <Button type="submit" className="ml-2 w-full" loading={processing} variant="confirm">Adicionar</Button>
                            </DialogFooter>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
