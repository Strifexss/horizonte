import { router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CategoriaRow from './CategoriaRow';

type Categoria = {
    id: number | string;
    nome: string;
    tipo: 'receita' | 'despesa';
    padrao?: number | null;
};

type CategoriasPageProps = {
    categorias?: Categoria[];
};

export default function CategoriasModal({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const page = usePage<CategoriasPageProps>();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [categoriaToDelete, setCategoriaToDelete] = useState<number | string | null>(null);
    const [activeTab, setActiveTab] = useState<'receita' | 'despesa'>('despesa');
    const [editingId, setEditingId] = useState<number | string | null>(null);

    const {
        data,
        setData,
        post,
        patch,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        nome: '',
        padrao: 0,
        tipo: activeTab,
    });

    useEffect(() => {
        setData('tipo', activeTab);
    }, [activeTab]);

    // when page prop `categorias` changes, update local state
    useEffect(() => {
        const p = page.props?.categorias;
        if (!p) {
            setCategorias([]);
            return;
        }
        setCategorias(Array.isArray(p) ? p : p);
    }, [page.props?.categorias]);

    useEffect(() => {
        if (!open) return;
        // load categorias on-demand via Inertia
        setLoading(true);
        router.reload({
            only: ['categorias'],
            onFinish: () => setLoading(false),
        });
        // reset form when opening
        reset();
        clearErrors();
        setEditingId(null);
    }, [open]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            patch(route('categorias.update', editingId), {
                onSuccess: () => {
                    router.reload({ only: ['categorias'] });
                    reset();
                    setEditingId(null);
                },
            });
        } else {
            post(route('categorias.store'), {
                onSuccess: () => {
                    router.reload({ only: ['categorias'] });
                    reset();
                },
            });
        }
    };

    const startEdit = (cat: Categoria) => {
        setEditingId(cat.id);
        setData('nome', cat.nome);
        setData('padrao', cat.padrao ?? 0);
        setData('tipo', cat.tipo);
    };

    const doDelete = (id: number | string) => {
        // open confirmation dialog instead of window.confirm
        setCategoriaToDelete(id);
        setConfirmOpen(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100dvh] w-[100vw] overflow-hidden md:h-auto md:w-[700px] md:max-w-full">
                <DialogHeader>
                    <DialogTitle>Categorias</DialogTitle>
                    <DialogDescription>Gerencie categorias de receita e despesa.</DialogDescription>
                </DialogHeader>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className={`rounded-md px-3 py-1 ${activeTab === 'receita' ? 'bg-primary text-primary-foreground' : 'bg-muted/5'}`}
                            onClick={() => setActiveTab('receita')}
                        >
                            Receita
                        </button>
                        <button
                            type="button"
                            className={`rounded-md px-3 py-1 ${activeTab === 'despesa' ? 'bg-primary text-primary-foreground' : 'bg-muted/5'}`}
                            onClick={() => setActiveTab('despesa')}
                        >
                            Despesa
                        </button>
                    </div>

                    <div className="border-sidebar-border/70 mt-4 rounded-lg border bg-white p-4 shadow-sm dark:bg-slate-900">
                        <form onSubmit={submit} className="grid gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor="nome">Nome</Label>
                                <Input
                                    id="nome"
                                    value={data.nome}
                                    onChange={(e) => setData('nome', e.target.value)}
                                    placeholder="Nome da categoria"
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

                        <div className="mt-2 max-h-[340px] min-h-[200px] overflow-y-auto">
                            {loading ? (
                                <div>Carregando...</div>
                            ) : (
                                <div className="grid gap-2">
                                    {categorias
                                        .filter((c) => c.tipo === activeTab)
                                        .map((c) => (
                                            <CategoriaRow key={c.id} categoria={c} onEdit={() => startEdit(c)} onDelete={() => doDelete(c.id)} />
                                        ))}
                                    {categorias.filter((c) => c.tipo === activeTab).length === 0 && (
                                        <div className="text-muted-foreground text-sm">Nenhuma categoria encontrada.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Delete confirmation dialog */}
                    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmar exclusão</DialogTitle>
                                <DialogDescription>Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.</DialogDescription>
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
                                        if (!categoriaToDelete) return;
                                        destroy(route('categorias.destroy', categoriaToDelete), {
                                            onSuccess: () => {
                                                setConfirmOpen(false);
                                                setCategoriaToDelete(null);
                                                router.reload({ only: ['categorias'] });
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
