import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MoneyInput from '@/components/ui/money-input';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import type { ProdutoItem } from '@/components/produtos/types';

type Mode = 'create' | 'edit';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: Mode;
    produto: ProdutoItem | null;
};

type ProdutoFormValues = {
    nome: string;
    preco_compra: string;
    preco_venda: string;
    ativo: boolean;
};

export default function ProdutosForm({ open, onOpenChange, mode, produto }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<ProdutoFormValues>({
        nome: '',
        preco_compra: '',
        preco_venda: '',
        ativo: true,
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        clearErrors();

        if (mode === 'edit' && produto) {
            setData({
                nome: produto.nome,
                preco_compra: produto.preco_compra,
                preco_venda: produto.preco_venda,
                ativo: produto.ativo,
            });
            return;
        }

        reset();
        setData({
            nome: '',
            preco_compra: '',
            preco_venda: '',
            ativo: true,
        });
        // setData/reset/clearErrors vêm do useForm e são estáveis o bastante para este reset de abertura.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, produto]);

    const submit = (event: React.FormEvent): void => {
        event.preventDefault();

        const options = {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        };

        if (mode === 'edit' && produto) {
            put(route('produtos.update', produto.id), options);
            return;
        }

        post(route('produtos.store'), options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100vh] w-[100vw] overflow-hidden md:h-auto md:w-[700px] md:max-w-full">
                <DialogHeader>
                    <DialogTitle>{mode === 'edit' ? 'Editar produto' : 'Cadastrar produto'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'edit' ? 'Atualize os dados do produto.' : 'Preencha os dados para cadastrar um novo produto.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="flex h-full flex-col gap-4" noValidate>
                    <div className="grid gap-2">
                        <Label htmlFor="produto_nome">Nome</Label>
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
                        <Label htmlFor="produto_preco_compra">Preço de compra</Label>
                        <MoneyInput
                            id="produto_preco_compra"
                            value={data.preco_compra ? Number(data.preco_compra) : null}
                            onValueChange={(value) => setData('preco_compra', value === null ? '' : value.toFixed(2))}
                            placeholder="0,00"
                            disabled={processing}
                        />
                        <InputError message={errors.preco_compra} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="produto_preco_venda">Preço de venda</Label>
                        <MoneyInput
                            id="produto_preco_venda"
                            value={data.preco_venda ? Number(data.preco_venda) : null}
                            onValueChange={(value) => setData('preco_venda', value === null ? '' : value.toFixed(2))}
                            placeholder="0,00"
                            disabled={processing}
                        />
                        <InputError message={errors.preco_venda} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="produto_ativo"
                            checked={data.ativo}
                            onCheckedChange={(checked) => setData('ativo', checked === true)}
                            disabled={processing}
                        />
                        <Label htmlFor="produto_ativo">Produto ativo</Label>
                    </div>
                    <InputError message={errors.ativo} />

                    <DialogFooter className="flex flex-row gap-2">
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
