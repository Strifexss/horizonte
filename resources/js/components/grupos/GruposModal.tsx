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
import GrupoRow from './GrupoRow';

type Grupo = {
    id: number | string;
    nome: string;
};

type GrupoCriado = {
    id: number;
    nome: string;
};

const visitGrupos = {
    preserveScroll: true,
    preserveState: true,
    only: ['grupos', 'flash'],
};

export default function GruposModal({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (b: boolean) => void;
    onCreated?: (grupo: GrupoCriado) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const page = usePage<any>();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [grupoToDelete, setGrupoToDelete] = useState<Grupo | null>(null);
    const [editingId, setEditingId] = useState<number | string | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nome: '',
    });

    useEffect(() => {
        const g = page.props?.grupos;
        if (!g) {
            setGrupos([]);
            return;
        }
        setGrupos(Array.isArray(g) ? g : g);
    }, [page.props?.grupos]);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        router.reload({
            ...visitGrupos,
            onFinish: () => setLoading(false),
        });
        reset();
        clearErrors();
        setEditingId(null);
    }, [open]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('grupos.update', editingId), {
                ...visitGrupos,
                onSuccess: () => {
                    reset();
                    setEditingId(null);
                },
            });
        } else {
            post(route('grupos.store'), {
                ...visitGrupos,
                onSuccess: (pageResult) => {
                    reset();
                    const criado = (pageResult.props as any)?.flash?.grupo_criado as GrupoCriado | undefined;
                    if (criado && onCreated) {
                        onCreated(criado);
                        onOpenChange(false);
                    }
                },
            });
        }
    };

    const startEdit = (grupo: Grupo) => {
        setEditingId(grupo.id);
        setData('nome', grupo.nome);
    };

    const doDelete = (grupo: Grupo) => {
        setGrupoToDelete(grupo);
        setConfirmOpen(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[100vw] h-[100dvh] md:w-[700px] md:max-w-full md:h-auto overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Grupos</DialogTitle>
                    <DialogDescription>Gerencie os grupos de produtos.</DialogDescription>
                </DialogHeader>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                    <div className="mt-4 rounded-lg border border-sidebar-border/70 bg-white dark:bg-slate-900 p-4 shadow-sm">
                        <form onSubmit={submit} noValidate className="grid gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor="grupo_nome">Nome do Grupo</Label>
                                <Input
                                    id="grupo_nome"
                                    value={data.nome}
                                    onChange={(e) => setData('nome', e.target.value)}
                                    placeholder="Nome do grupo"
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

                        <div className="mt-2 overflow-y-auto min-h-[200px] max-h-[340px]">
                            {loading ? (
                                <div>Carregando...</div>
                            ) : (
                                <div className="grid gap-2">
                                    {grupos.map((g) => (
                                        <GrupoRow
                                            key={g.id}
                                            grupo={g}
                                            onEdit={() => startEdit(g)}
                                            onDelete={() => doDelete(g)}
                                        />
                                    ))}
                                    {grupos.length === 0 && (
                                        <div className="text-sm text-muted-foreground">Nenhum grupo encontrado.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <DialogContent className="h-auto max-h-[90dvh] w-full max-w-md md:w-[420px]">
                            <DialogHeader>
                                <DialogTitle>Confirmar exclusão</DialogTitle>
                                <DialogDescription>
                                    O grupo &quot;{grupoToDelete?.nome ?? ''}&quot; será removido. Os produtos
                                    vinculados permanecerão, mas sem o grupo associado (o vínculo será limpo).
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
                                        if (!grupoToDelete) return;
                                        destroy(route('grupos.destroy', grupoToDelete.id), {
                                            ...visitGrupos,
                                            onSuccess: () => {
                                                setConfirmOpen(false);
                                                setGrupoToDelete(null);
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
