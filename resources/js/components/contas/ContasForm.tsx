import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog } from '@/components/ui/dialog';
import { FormDialogBody, FormDialogCancel, FormDialogContent, FormDialogFooter, FormDialogForm, FormDialogHeader } from '@/components/ui/form-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    description?: string;
    onCreated?: () => void;
};

export default function ContasForm({ open, onOpenChange, description = 'Preencha os dados para cadastrar uma nova conta.', onCreated }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        nome: '',
        descricao: '',
        padrao: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('contas.store'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
                onCreated?.();
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    clearErrors();
                }
                onOpenChange(next);
            }}
        >
            <FormDialogContent className="md:w-[500px]">
                <FormDialogHeader title="Adicionar conta" description={description} />

                <FormDialogForm onSubmit={submit}>
                    <FormDialogBody>
                        <div className="grid gap-2">
                            <Label htmlFor="conta-nome">Nome</Label>
                            <Input
                                id="conta-nome"
                                value={data.nome}
                                onChange={(e) => setData('nome', e.target.value)}
                                placeholder="Ex: Conta corrente"
                                disabled={processing}
                            />
                            <InputError message={errors.nome} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="conta-descricao">Descrição</Label>
                            <Input
                                id="conta-descricao"
                                value={data.descricao}
                                onChange={(e) => setData('descricao', e.target.value)}
                                placeholder="Opcional"
                                disabled={processing}
                            />
                            <InputError message={errors.descricao} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="conta-padrao"
                                checked={!!data.padrao}
                                onCheckedChange={(checked) => setData('padrao', checked === true)}
                                disabled={processing}
                            />
                            <Label htmlFor="conta-padrao">Definir como conta padrão</Label>
                        </div>
                        <InputError message={errors.padrao} />
                    </FormDialogBody>

                    <FormDialogFooter>
                        <FormDialogCancel className="w-full" disabled={processing} />
                        <Button type="submit" variant="confirm" className="w-full" loading={processing}>
                            Salvar
                        </Button>
                    </FormDialogFooter>
                </FormDialogForm>
            </FormDialogContent>
        </Dialog>
    );
}
