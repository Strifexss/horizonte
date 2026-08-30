import React, { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';

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

export default function ExtratoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
    const [activeTab, setActiveTab] = useState<'RECEITA' | 'DESPESA'>('DESPESA');
    const [selectedConta, setSelectedConta] = useState<Option | null>(null);
    const [selectedCategoria, setSelectedCategoria] = useState<Option | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        descricao: '',
        valor: '',
        tipo: activeTab,
        categoria_id: null as number | null,
        conta_id: null as number | null,
    });

    useEffect(() => {
        setData('tipo', activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (!open) return;
        // reset form when opening
        reset();
        clearErrors();
        setSelectedCategoria(null);
        setSelectedConta(null);
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
        const payload = {
            descricao: data.descricao,
            valor: String(Number(data.valor || 0)),
            tipo: activeTab,
            conta_id: selectedConta ? Number(selectedConta.id) : null,
            categoria_id: selectedCategoria ? Number(selectedCategoria.id) : null,
        };

        router.post(route('extrato.store'), payload, {
            onSuccess: () => {
                reset();
                onOpenChange(false);
                router.reload({ only: ['extratos', 'categorias'] });
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
                                    <Label htmlFor="valor">Valor</Label>
                                    <Input
                                        id="valor"
                                        value={data.valor}
                                        onChange={(e) => setData('valor', e.target.value)}
                                        placeholder="0.00"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.valor} />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                    <Label>Conta</Label>
                                    <AsyncSelect
                                        value={selectedConta}
                                        onChange={(val) => {
                                            setSelectedConta(val);
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
                                        }}
                                        loadOptions={loadCategorias}
                                        placeholder="Selecione a categoria (opcional)"
                                        isClearable
                                    />
                                    <InputError message={errors.categoria_id} />
                                </div>
                            </div>

                            <DialogFooter className='flex flex-row gap-2 mt-4'>
                                <DialogClose asChild>
                                    <Button className='w-full' variant="secondary" type="button" onClick={() => { reset(); }}>
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className="ml-2 w-full" disabled={processing} variant="confirm">
                                    Adicionar
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

