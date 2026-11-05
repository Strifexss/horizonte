import { router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { FORM_DIALOG_LIST, FORM_DIALOG_PANEL, FormDialogBody, FormDialogContent, FormDialogHeader } from '@/components/ui/form-dialog';
import { FormDialogCorrecao, FormDialogField } from '@/components/ui/form-dialog-correcao';
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
            <FormDialogContent>
                <FormDialogHeader title="Fornecedores" description="Gerencie os fornecedores." />
                <FormDialogCorrecao errors={errors} formId="fornecedor_form" processing={processing} titulo="Corrigir fornecedor">
                    <FormDialogBody>
                        <div className={FORM_DIALOG_PANEL}>
                            <form id="fornecedor_form" onSubmit={submit} className="grid gap-2">
                                <FormDialogField name="nome">
                                    <Label htmlFor="fornecedor_nome">Nome do Fornecedor</Label>
                                    <Input
                                        id="fornecedor_nome"
                                        value={data.nome}
                                        onChange={(e) => setData('nome', e.target.value)}
                                        placeholder="Nome do fornecedor"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.nome} />
                                </FormDialogField>

                                <DialogFooter className="flex flex-row gap-2">
                                    <DialogClose asChild>
                                        <Button
                                            className="hidden w-full md:inline-flex"
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

                            <div className={FORM_DIALOG_LIST}>
                                {loading ? (
                                    <div>Carregando...</div>
                                ) : (
                                    <div className="grid gap-2">
                                        {fornecedores.map((f) => (
                                            <div key={f.id} className="flex items-center justify-between gap-2 rounded border p-2">
                                                <div>{f.nome}</div>
                                            </div>
                                        ))}
                                        {fornecedores.length === 0 && (
                                            <div className="text-muted-foreground text-sm">Nenhum fornecedor encontrado.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </FormDialogBody>
                </FormDialogCorrecao>
            </FormDialogContent>
        </Dialog>
    );
}
