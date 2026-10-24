import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
            <DialogContent className="h-[100vh] w-[100vw] overflow-hidden md:h-auto md:w-[500px] md:max-w-full">
                <div className="flex h-full flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Adicionar conta</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="grid gap-4">
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

                        <DialogFooter className="flex flex-row gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary" type="button" className="w-full" disabled={processing}>
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button type="submit" variant="confirm" className="w-full" loading={processing}>
                                Salvar
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
