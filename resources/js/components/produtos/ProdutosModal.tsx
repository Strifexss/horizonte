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
import ProdutoRow from './ProdutoRow';

type Produto = {
    id: number | string;
    nome: string;
    preco_compra: number | string;
};

type ProdutoCriado = {
    id: number;
    nome: string;
    preco_compra: number | string;
};

export default function ProdutosModal({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (b: boolean) => void;
    onCreated?: (produto: ProdutoCriado) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const page = usePage<any>();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [produtoToDelete, setProdutoToDelete] = useState<Produto | null>(null);
    const [editingId, setEditingId] = useState<number | string | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nome: '',
        preco_compra: '',
    });

    useEffect(() => {
        const p = page.props?.produtos;
        if (!p) {
            setProdutos([]);
            return;
        }
        setProdutos(Array.isArray(p) ? p : p);
    }, [page.props?.produtos]);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        router.reload({
            only: ['produtos'],
            onFinish: () => setLoading(false),
        });
        reset();
        clearErrors();
        setEditingId(null);
    }, [open]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('produtos.update', editingId), {
                onSuccess: () => {
                    router.reload({ only: ['produtos'] });
                    reset();
                    setEditingId(null);
                },
            });
        } else {
            post(route('produtos.store'), {
                onSuccess: (pageResult) => {
                    router.reload({ only: ['produtos'] });
                    reset();
                    const criado = (pageResult.props as any)?.flash?.produto_criado as ProdutoCriado | undefined;
                    if (criado && onCreated) {
                        onCreated(criado);
                        onOpenChange(false);
                    }
                },
            });
        }
    };

    const startEdit = (produto: Produto) => {
        setEditingId(produto.id);
        setData('nome', produto.nome);
        setData('preco_compra', String(produto.preco_compra));
    };

    const doDelete = (produto: Produto) => {
        setProdutoToDelete(produto);
        setConfirmOpen(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[100vw] h-[100dvh] md:w-[700px] md:max-w-full md:h-auto overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Produtos</DialogTitle>
                    <DialogDescription>Gerencie os produtos vinculados às despesas.</DialogDescription>
                </DialogHeader>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                    <div className="mt-4 rounded-lg border border-sidebar-border/70 bg-white dark:bg-slate-900 p-4 shadow-sm">
                        <form onSubmit={submit} className="grid gap-2">
                            <div className="grid md:grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="produto_nome">Nome do Produto</Label>
                                    <Input
                                        id="produto_nome"
                                        value={data.nome}
                                        onChange={(e) => setData('nome', e.target.value)}
                                        placeholder="Nome do produto"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.nome} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="preco_compra">Preço de Compra</Label>
                                    <Input
                                        id="preco_compra"
                                        type="number"
                                        min={0.01}
                                        step="0.01"
                                        value={data.preco_compra}
                                        onChange={(e) => setData('preco_compra', e.target.value)}
                                        placeholder="0.00"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.preco_compra} />
                                </div>
                            </div>

                            <DialogFooter className="flex flex-row gap-2">
                                <DialogClose asChild>
                                    <Button
                                        className="w-full"
                                        variant="secondary"
                                        type="button"
                                        onClick={() => {
                                            reset();
                                            setEditingId(null);
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className="w-full" disabled={processing} variant="confirm">
                                    {editingId ? 'Atualizar' : 'Adicionar'}
                                </Button>
                            </DialogFooter>
                        </form>

                        <div className="mt-2 overflow-y-auto min-h-[200px] max-h-[340px]">
                            {loading ? (
                                <div>Carregando...</div>
                            ) : (
                                <div className="grid gap-2">
                                    {produtos.map((p) => (
                                        <ProdutoRow
                                            key={p.id}
                                            produto={p}
                                            onEdit={() => startEdit(p)}
                                            onDelete={() => doDelete(p)}
                                        />
                                    ))}
                                    {produtos.length === 0 && (
                                        <div className="text-sm text-muted-foreground">Nenhum produto encontrado.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmar exclusão</DialogTitle>
                                <DialogDescription>
                                    O produto &quot;{produtoToDelete?.nome ?? ''}&quot; será removido. Os lançamentos
                                    vinculados permanecerão, mas sem o produto associado (o vínculo será limpo).
                                    Esta ação não pode ser desfeita.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button
                                    variant="destructive"
                                    className="ml-2"
                                    onClick={() => {
                                        if (!produtoToDelete) return;
                                        destroy(route('produtos.destroy', produtoToDelete.id), {
                                            onSuccess: () => {
                                                setConfirmOpen(false);
                                                setProdutoToDelete(null);
                                                router.reload({ only: ['produtos'] });
                                            },
                                        });
                                    }}
                                >
                                    Excluir
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </DialogContent>
        </Dialog>
    );
}
