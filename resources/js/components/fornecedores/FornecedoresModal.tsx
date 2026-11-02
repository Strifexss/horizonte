import { router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Fornecedor = {
    id: number | string;
    nome: string;
};

type FornecedorCriado = {
    id: number;
    nome: string;
};

type FornecedoresPageProps = {
    fornecedores?: Fornecedor[];
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
    const page = usePage<FornecedoresPageProps>();

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
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
                const flash = pageResult.props.flash as { fornecedor_criado?: FornecedorCriado } | undefined;
                const criado = flash?.fornecedor_criado;
                if (criado && onCreated) {
                    onCreated(criado);
                    onOpenChange(false);
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100dvh] w-[100vw] overflow-hidden md:h-auto md:w-[700px] md:max-w-full">
                <DialogHeader>
                    <DialogTitle>Fornecedores</DialogTitle>
                    <DialogDescription>Gerencie os fornecedores.</DialogDescription>
                </DialogHeader>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                    <div className="border-sidebar-border/70 mt-4 rounded-lg border bg-white p-4 shadow-sm dark:bg-slate-900">
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

                        <div className="mt-2 max-h-[340px] min-h-[200px] overflow-y-auto">
                            {loading ? (
                                <div>Carregando...</div>
                            ) : (
                                <div className="grid gap-2">
                                    {fornecedores.map((f) => (
                                        <div key={f.id} className="flex items-center justify-between gap-2 rounded border p-2">
                                            <div>{f.nome}</div>
                                        </div>
                                    ))}
                                    {fornecedores.length === 0 && <div className="text-muted-foreground text-sm">Nenhum fornecedor encontrado.</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
