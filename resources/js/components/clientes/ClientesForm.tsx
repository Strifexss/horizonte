import type { ClienteCriado, ClienteItem } from '@/components/clientes/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect, type FormEvent } from 'react';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cliente: ClienteItem | null;
    /** Chamado após cadastrar, com o cliente criado (ex.: para já escolhê-lo na venda). */
    onCreated?: (cliente: ClienteCriado) => void;
    /** Props a recarregar após salvar; por padrão recarrega a página inteira. */
    only?: string[];
};

type ClienteFormValues = {
    nome: string;
    telefone: string;
    documento: string;
    email: string;
    observacao: string;
    ativo: boolean;
};

function valoresDo(cliente: ClienteItem | null): ClienteFormValues {
    return {
        nome: cliente?.nome ?? '',
        telefone: cliente?.telefone ?? '',
        documento: cliente?.documento ?? '',
        email: cliente?.email ?? '',
        observacao: cliente?.observacao ?? '',
        ativo: cliente?.ativo ?? true,
    };
}

export default function ClientesForm({ open, onOpenChange, cliente, onCreated, only }: Props) {
    const { data, setData, post, put, processing, errors, clearErrors } = useForm<ClienteFormValues>(valoresDo(cliente));

    useEffect(() => {
        if (open) {
            setData(valoresDo(cliente));
            clearErrors();
        }
        // setData/clearErrors vêm do useForm e são estáveis o bastante para este reset de abertura.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, cliente?.id]);

    function submit(event: FormEvent): void {
        event.preventDefault();
        event.stopPropagation();

        const options = {
            preserveScroll: true,
            preserveState: true,
            ...(only ? { only: [...only, 'flash'] } : {}),
            onSuccess: (page: { props: unknown }) => {
                const criado = (page.props as { flash?: { cliente_criado?: ClienteCriado } }).flash?.cliente_criado;
                if (!cliente && criado) {
                    onCreated?.(criado);
                }
                onOpenChange(false);
            },
        };

        if (cliente) {
            put(route('clientes.update', cliente.id), options);
            return;
        }

        post(route('clientes.store'), options);
    }

    function campo(id: keyof Omit<ClienteFormValues, 'ativo'>, label: string, placeholder = '', type = 'text') {
        return (
            <div className="grid gap-2">
                <Label htmlFor={`cliente_${id}`}>{label}</Label>
                <Input
                    id={`cliente_${id}`}
                    type={type}
                    value={data[id]}
                    onChange={(e) => setData(id, e.target.value)}
                    placeholder={placeholder}
                    disabled={processing}
                />
                <InputError message={errors[id]} />
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100vh] w-[100vw] overflow-hidden md:h-auto md:w-[560px] md:max-w-full">
                <DialogHeader>
                    <DialogTitle>{cliente ? 'Editar cliente' : 'Cadastrar cliente'}</DialogTitle>
                    <DialogDescription>
                        {cliente ? 'Atualize os dados do cliente.' : 'Preencha os dados para cadastrar um novo cliente.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="flex h-full flex-col gap-4 overflow-y-auto" noValidate>
                    {campo('nome', 'Nome', 'Nome do cliente')}
                    <div className="grid gap-4 md:grid-cols-2">
                        {campo('telefone', 'Telefone / WhatsApp', '(00) 00000-0000', 'tel')}
                        {campo('documento', 'CPF / CNPJ', 'Opcional')}
                    </div>
                    {campo('email', 'E-mail', 'Opcional', 'email')}
                    {campo('observacao', 'Observação', 'Ex.: endereço de entrega, preferências')}

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="cliente_ativo"
                            checked={data.ativo}
                            onCheckedChange={(checked) => setData('ativo', checked === true)}
                            disabled={processing}
                        />
                        <Label htmlFor="cliente_ativo">Cliente ativo</Label>
                    </div>

                    <DialogFooter className="mt-auto flex flex-row gap-2">
                        <DialogClose asChild>
                            <Button className="w-full" variant="secondary" type="button" disabled={processing}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button className="w-full" type="submit" variant="confirm" disabled={processing}>
                            Salvar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
