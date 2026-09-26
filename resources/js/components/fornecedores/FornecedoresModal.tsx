import React, { useEffect, useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';

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

type Fornecedor = {
    id: number | string;
    nome: string;
};

type FornecedorCriado = {
    id: number;
    nome: string;
};

export default function FornecedoresModal({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (b: boolean) => void;
    onCreated?: (fornecedor: FornecedorCriado) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const page = usePage<any>();

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nome: '',
    });

    useEffect(() => {
        const f = page.props?.fornecedores;
        if (!f) {
            setFornecedores([]);
            return;
        }
        setFornecedores(Array.isArray(f) ? f : f);
    }, [page.props?.fornecedores]);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        router.reload({
            only: ['fornecedores'],
            onFinish: () => setLoading(false),
        });
        reset();
        clearErrors();
    }, [open]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('fornecedores.store'), {
            onSuccess: (pageResult) => {
                router.reload({ only: ['fornecedores'] });
                reset();
                const criado = (pageResult.props as any)?.flash?.fornecedor_criado as FornecedorCriado | undefined;
                if (criado && onCreated) {
                    onCreated(criado);
                    onOpenChange(false);
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[100vw] h-[100dvh] md:w-[700px] md:max-w-full md:h-auto overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Fornecedores</DialogTitle>
                    <DialogDescription>Gerencie os fornecedores.</DialogDescription>
                </DialogHeader>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                    <div className="mt-4 rounded-lg border border-sidebar-border/70 bg-white dark:bg-slate-900 p-4 shadow-sm">
                        <form onSubmit={submit} className="grid gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor="fornecedor_nome">Nome do Fornecedor</Label>
                                <Input
                                    id="fornecedor_nome"
                                    value={data.nome}
                                    onChange={(e) => setData('nome', e.target.value)}
                                    placeholder="Nome do fornecedor"
                                    disabled={processing}
                                />
                                <InputError message={errors.nome} />
                            </div>

                            <DialogFooter className="flex flex-row gap-2">
                                <DialogClose asChild>
                                    <Button
                                        className="w-full"
                                        variant="secondary"
                                        type="button"
                                        onClick={() => {
                                            reset();
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className="w-full" disabled={processing} variant="confirm">
                                    Adicionar
                                </Button>
                            </DialogFooter>
                        </form>

                        <div className="mt-2 overflow-y-auto min-h-[200px] max-h-[340px]">
                            {loading ? (
                                <div>Carregando...</div>
                            ) : (
                                <div className="grid gap-2">
                                    {fornecedores.map((f) => (
                                        <div key={f.id} className="flex items-center justify-between gap-2 p-2 border rounded">
                                            <div>{f.nome}</div>
                                        </div>
                                    ))}
                                    {fornecedores.length === 0 && (
                                        <div className="text-sm text-muted-foreground">Nenhum fornecedor encontrado.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

