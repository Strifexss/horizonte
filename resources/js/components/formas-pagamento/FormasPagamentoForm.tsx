import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    forma: FormaPagamentoItem | null;
    /** Cadastro feito por outra tela: recarrega só as formas da page e devolve a criada, sem recarregar o resto. */
    onCreated?: (forma: FormaPagamentoItem) => void;
};

type FormaPagamentoFormValues = {
    nome: string;
    baixa_automatica: boolean;
    ativo: boolean;
};

export default function FormasPagamentoForm({ open, onOpenChange, forma, onCreated }: Props) {
    const { data, setData, post, put, processing, errors, clearErrors } = useForm<FormaPagamentoFormValues>({
        nome: '',
        baixa_automatica: true,
        ativo: true,
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        clearErrors();
        setData({
            nome: forma?.nome ?? '',
            baixa_automatica: forma?.baixa_automatica ?? true,
            ativo: forma?.ativo ?? true,
        });
        // setData/clearErrors vêm do useForm e são estáveis o bastante para este reset de abertura.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, forma]);

    const submit = (event: React.FormEvent): void => {
        event.preventDefault();

        const options = { preserveState: true, preserveScroll: true, onSuccess: () => onOpenChange(false) };

        if (forma) {
            put(route('formas-pagamento.update', forma.id), options);
            return;
        }

        if (!onCreated) {
            post(route('formas-pagamento.store'), options);
            return;
        }

        post(route('formas-pagamento.store'), {
            ...options,
            only: ['formas_pagamento', 'flash'],
            onSuccess: (pagina) => {
                onOpenChange(false);

                const criada = (pagina.props.flash as { forma_pagamento_criada?: FormaPagamentoItem } | undefined)?.forma_pagamento_criada;
                if (criada) {
                    onCreated(criada);
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100vh] w-[100vw] overflow-hidden md:h-auto md:w-[500px] md:max-w-full">
                <DialogHeader>
                    <DialogTitle>{forma ? 'Editar forma de pagamento' : 'Nova forma de pagamento'}</DialogTitle>
                    <DialogDescription>Formas cadastradas aqui aparecem só para você.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="flex h-full flex-col gap-4 overflow-y-auto" noValidate>
                    <div className="grid gap-2">
                        <Label htmlFor="forma_pagamento_nome">Nome</Label>
                        <Input
                            id="forma_pagamento_nome"
                            value={data.nome}
                            onChange={(event) => setData('nome', event.target.value)}
                            placeholder="Ex.: Boleto, Vale refeição"
                            disabled={processing}
                            autoFocus
                        />
                        <InputError message={errors.nome} />
                    </div>

                    <div className="grid gap-1">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="forma_pagamento_baixa"
                                checked={data.baixa_automatica}
                                onCheckedChange={(checked) => setData('baixa_automatica', checked === true)}
                                disabled={processing}
                            />
                            <Label htmlFor="forma_pagamento_baixa">Baixa automática</Label>
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Receitas de venda com esta forma já entram pagas. Sem ela, entram em aberto para baixar depois.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="forma_pagamento_ativo"
                            checked={data.ativo}
                            onCheckedChange={(checked) => setData('ativo', checked === true)}
                            disabled={processing}
                        />
                        <Label htmlFor="forma_pagamento_ativo">Ativa</Label>
                    </div>

                    <DialogFooter className="mt-auto flex flex-row gap-2 md:mt-0">
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
