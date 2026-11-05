import { router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FORM_DIALOG_LIST, FORM_DIALOG_PANEL, FormDialogBody, FormDialogContent, FormDialogHeader } from '@/components/ui/form-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GrupoRow from './GrupoRow';

type Grupo = {
    id: number | string;
    nome: string;
};

type GrupoCriado = {
    id: number;
    nome: string;
};

type GruposPageProps = {
    grupos?: Grupo[];
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
    const page = usePage<GruposPageProps>();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [grupoToDelete, setGrupoToDelete] = useState<Grupo | null>(null);
    const [editingId, setEditingId] = useState<number | string | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
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
                    const flash = pageResult.props.flash as { grupo_criado?: GrupoCriado } | undefined;
                    const criado = flash?.grupo_criado;
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
            <FormDialogContent>
                <FormDialogHeader title="Grupos" description="Gerencie os grupos de produtos." />
                <FormDialogBody>
                    <div className={FORM_DIALOG_PANEL}>
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
                                        className="hidden w-full md:inline-flex"
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

                        <div className={FORM_DIALOG_LIST}>
                            {loading ? (
                                <div>Carregando...</div>
                            ) : (
                                <div className="grid gap-2">
                                    {grupos.map((g) => (
                                        <GrupoRow key={g.id} grupo={g} onEdit={() => startEdit(g)} onDelete={() => doDelete(g)} />
                                    ))}
                                    {grupos.length === 0 && <div className="text-muted-foreground text-sm">Nenhum grupo encontrado.</div>}
                                </div>
                            )}
                        </div>
                    </div>

                    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <DialogContent className="h-auto max-h-[90dvh] w-full max-w-md md:w-[420px]">
                            <DialogHeader>
                                <DialogTitle>Confirmar exclusão</DialogTitle>
                                <DialogDescription>
                                    O grupo &quot;{grupoToDelete?.nome ?? ''}&quot; será removido. Os produtos vinculados permanecerão, mas sem o
                                    grupo associado (o vínculo será limpo). Esta ação não pode ser desfeita.
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
                </FormDialogBody>
            </FormDialogContent>
        </Dialog>
    );
}
