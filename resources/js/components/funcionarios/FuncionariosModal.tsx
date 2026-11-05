import { router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FORM_DIALOG_LIST, FORM_DIALOG_PANEL, FormDialogBody, FormDialogContent, FormDialogHeader } from '@/components/ui/form-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MoneyInput, { parseMoneyValue } from '@/components/ui/money-input';
import FuncionarioRow from './FuncionarioRow';

type Funcionario = {
    id: number | string;
    nome: string;
    salario: number | string;
};

type FuncionarioCriado = {
    id: number;
    nome: string;
    salario: number | string;
};

type FuncionariosPageProps = {
    funcionarios?: Funcionario[];
};

export default function FuncionariosModal({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (b: boolean) => void;
    onCreated?: (funcionario: FuncionarioCriado) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const page = usePage<FuncionariosPageProps>();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [funcionarioToDelete, setFuncionarioToDelete] = useState<Funcionario | null>(null);
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
        salario: '',
    });

    useEffect(() => {
        const p = page.props?.funcionarios;
        if (!p) {
            setFuncionarios([]);
            return;
        }
        setFuncionarios(Array.isArray(p) ? p : p);
    }, [page.props?.funcionarios]);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        router.reload({
            only: ['funcionarios'],
            onFinish: () => setLoading(false),
        });
        reset();
        clearErrors();
        setEditingId(null);
    }, [open]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('funcionarios.update', editingId), {
                onSuccess: () => {
                    router.reload({ only: ['funcionarios'] });
                    reset();
                    setEditingId(null);
                },
            });
        } else {
            post(route('funcionarios.store'), {
                onSuccess: (pageResult) => {
                    router.reload({ only: ['funcionarios'] });
                    reset();
                    const flash = pageResult.props.flash as { funcionario_criado?: FuncionarioCriado } | undefined;
                    const criado = flash?.funcionario_criado;
                    if (criado && onCreated) {
                        onCreated(criado);
                        onOpenChange(false);
                    }
                },
            });
        }
    };

    const startEdit = (funcionario: Funcionario) => {
        setEditingId(funcionario.id);
        setData('nome', funcionario.nome);
        setData(
            'salario',
            (() => {
                const parsed = parseMoneyValue(funcionario.salario);
                return parsed === null ? '' : parsed.toFixed(2);
            })(),
        );
    };

    const doDelete = (funcionario: Funcionario) => {
        setFuncionarioToDelete(funcionario);
        setConfirmOpen(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <FormDialogContent>
                <FormDialogHeader title="Funcionários" description="Gerencie os funcionários vinculados aos lançamentos de salário." />
                <FormDialogBody>
                    <div className={FORM_DIALOG_PANEL}>
                        <form onSubmit={submit} noValidate className="grid gap-2">
                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="funcionario_nome">Nome do Funcionário</Label>
                                    <Input
                                        id="funcionario_nome"
                                        value={data.nome}
                                        onChange={(e) => setData('nome', e.target.value)}
                                        placeholder="Nome do funcionário"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.nome} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="salario">Salário / Remuneração</Label>
                                    <MoneyInput
                                        id="salario"
                                        value={data.salario ? Number(data.salario) : null}
                                        onValueChange={(v) => setData('salario', v === null ? '' : v.toFixed(2))}
                                        placeholder="0,00"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.salario} />
                                </div>
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
                                    {funcionarios.map((f) => (
                                        <FuncionarioRow key={f.id} funcionario={f} onEdit={() => startEdit(f)} onDelete={() => doDelete(f)} />
                                    ))}
                                    {funcionarios.length === 0 && <div className="text-muted-foreground text-sm">Nenhum funcionário encontrado.</div>}
                                </div>
                            )}
                        </div>
                    </div>

                    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmar exclusão</DialogTitle>
                                <DialogDescription>
                                    O funcionário &quot;{funcionarioToDelete?.nome ?? ''}&quot; será removido. Os lançamentos vinculados permanecerão,
                                    mas sem o funcionário associado (o vínculo será limpo). Esta ação não pode ser desfeita.
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
                                        if (!funcionarioToDelete) return;
                                        destroy(route('funcionarios.destroy', funcionarioToDelete.id), {
                                            onSuccess: () => {
                                                setConfirmOpen(false);
                                                setFuncionarioToDelete(null);
                                                router.reload({ only: ['funcionarios'] });
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
